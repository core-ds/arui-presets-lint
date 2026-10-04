import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { isRecord } from './types.js';

const configFiles = {
    eslint: /^eslint\.config\./,
    secretlint: /^\.secretlintrc(?:\.|$)|^secretlint\.config\./,
    prettier: /^\.prettierrc(?:\.|$)|^prettier\.config\./,
    stylelint: /^\.stylelintrc(?:\.|$)|^stylelint\.config\./,
    commitlint: /^\.commitlintrc(?:\.|$)|^commitlint\.config\./,
};

export async function findExternalConfigs(cwd: string, files: string[], warnings: string[]) {
    const found = new Set<string>();
    const project = path.resolve(cwd);
    let directory = project;
    let entries = files;

    // Настройки могут лежать в родительском каталоге; новые конфиги не должны их перекрывать.
    for (;;) {
        for (const [key, pattern] of Object.entries(configFiles)) {
            if (entries.some((file) => pattern.test(file))) found.add(key);
        }

        if (entries.includes('.config')) {
            // Stylelint также ищет конфиги в .config. Проверяем имена, не запускаем их код.
            // Так поиск работает и без установленных пользовательских плагинов.
            // eslint-disable-next-line no-await-in-loop -- Ищем конфиги последовательно от проекта к корню, сохраняя порядок диагностики.
            const nested = await readdir(path.join(directory, '.config')).catch(
                (error: NodeJS.ErrnoException) => {
                    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error;
                    return [];
                },
            );

            if (nested.some((file) => /^stylelintrc(?:\.|$)/.test(file))) {
                found.add('stylelint');
            }
        }
        if (directory !== project && entries.includes('package.json')) {
            const parent: unknown = JSON.parse(
                // eslint-disable-next-line no-await-in-loop -- Читаем настройки очередного родительского каталога до перехода к следующему.
                await readFile(path.join(directory, 'package.json'), 'utf8'),
            );
            if (isRecord(parent)) {
                // eslintConfig в package.json — старый формат ESLint, а здесь ищем flat config.
                for (const key of Object.keys(configFiles).filter((name) => name !== 'eslint')) {
                    if (parent[key] !== undefined) found.add(key);
                }
            }
        }

        // Prettier и commitlint умеют читать настройки из package.yaml.
        // Без выполнения/преобразования YAML сохраняем этот источник и сообщаем о ручной проверке.
        if (entries.includes('package.yaml')) {
            found.add('prettier');
            found.add('commitlint');

            warnings.push(
                `Обнаружен package.yaml: настройки Prettier и commitlint не добавлены; проверьте их вручную (${directory}).`,
            );
        }

        const parent = path.dirname(directory);

        if (parent === directory || found.size === Object.keys(configFiles).length) {
            return found;
        }

        directory = parent;
        // eslint-disable-next-line no-await-in-loop -- Обход каталогов идёт от проекта к корню.
        entries = await readdir(directory);
    }
}
