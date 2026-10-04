import { lstat, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { findExternalConfigs } from './configs.js';
import { planPresets } from './presets.js';
import { planScripts } from './scripts.js';
import { type Edit, isRecord, type Manifest, type SetupPlan } from './types.js';

const flatConfig = `import { defineConfig, eslintConfig } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig);
`;

// Автоматически переносим только один наш пресет без пользовательских правил.
function isSimpleLegacyEslint(value: unknown): boolean {
    if (!isRecord(value) || Object.keys(value).some((key) => key !== 'extends')) {
        return false;
    }

    const extensions = Array.isArray(value.extends) ? value.extends : [value.extends];

    return (
        extensions.length === 1 &&
        typeof extensions[0] === 'string' &&
        /^(?:\.\/node_modules\/)?arui-presets-lint\/eslint(?:\/index\.js)?$/.test(extensions[0])
    );
}

function planEslint(
    pkg: Manifest,
    migrate: boolean,
    configs: { hasFlat: boolean; hasLegacyFile: boolean },
    warnings: string[],
): Edit | undefined {
    const { hasFlat, hasLegacyFile } = configs;
    const edit: Edit = { file: 'eslint.config.mts', before: null, after: flatConfig };

    if (!hasFlat && !hasLegacyFile && pkg.eslintConfig === undefined) {
        return edit;
    }
    if (!hasFlat && !hasLegacyFile && migrate && isSimpleLegacyEslint(pkg.eslintConfig)) {
        delete pkg.eslintConfig;
        return edit;
    }
    if (hasLegacyFile || pkg.eslintConfig !== undefined) {
        warnings.push(
            'Старый ESLint-конфиг сохранён: перенесите пользовательские правила в flat config вручную.',
        );
    }
}

export async function planSetup(cwd: string, migrate: boolean): Promise<SetupPlan> {
    const packagePath = path.join(cwd, 'package.json');
    const stat = await lstat(packagePath);

    if (!stat.isFile()) {
        throw new Error('package.json должен быть обычным файлом.');
    }

    const before = await readFile(packagePath, 'utf8');
    const pkg: unknown = JSON.parse(before);

    if (!isRecord(pkg)) {
        throw new Error('package.json должен содержать объект.');
    }

    if (pkg.scripts !== undefined && !isRecord(pkg.scripts)) {
        throw new Error('Поле scripts должно быть объектом.');
    }

    const original = JSON.stringify(pkg);
    const existing = await readdir(cwd);
    const edits: Edit[] = [];
    const warnings: string[] = [];
    const has = (pattern: RegExp) => existing.some((file) => pattern.test(file));
    const add = (file: string, after: string) => edits.push({ file, before: null, after });

    const externalConfigs = await findExternalConfigs(cwd, existing, warnings);
    const eslintEdit = planEslint(
        pkg,
        migrate,
        { hasFlat: externalConfigs.has('eslint'), hasLegacyFile: has(/^\.eslintrc(?:\.|$)/) },
        warnings,
    );
    if (eslintEdit) edits.push(eslintEdit);

    if (!has(/^(?:\.?knip(?:\.config)?\.(?:jsonc?|[cm]?[jt]s))$/) && pkg.knip === undefined) {
        add(
            'knip.ts',
            "import knipConfig from 'arui-presets-lint/knip';\n\nexport default knipConfig;\n",
        );
    } else {
        warnings.push('Конфиг Knip сохранён: проверьте, что он расширяет arui-presets-lint/knip.');
    }

    if (!externalConfigs.has('secretlint') && pkg.secretlint === undefined) {
        add(
            '.secretlintrc.json',
            `${JSON.stringify(
                {
                    rules: [{ id: '@secretlint/secretlint-rule-preset-recommend' }],
                },
                null,
                4,
            )}\n`,
        );
    }

    planPresets(cwd, pkg, externalConfigs, migrate);

    // Новые TS-конфиги могут не входить в include существующего проекта.
    const typedConfigs = edits
        .map((edit) => edit.file)
        .filter((file) => file.endsWith('.ts') || file.endsWith('.mts'));

    if (typedConfigs.length > 0) {
        warnings.push(
            `Проверьте include в tsconfig.json или allowDefaultProject ESLint для новых файлов: ${typedConfigs.join(', ')}.`,
        );
    }

    planScripts(pkg, migrate, warnings);

    const deps = [pkg.dependencies, pkg.devDependencies].filter(isRecord);

    if (!deps.some((dep) => dep['arui-presets-lint'] !== undefined)) {
        warnings.push(
            'Добавьте arui-presets-lint в devDependencies через пакетный менеджер проекта.',
        );
    }

    if (deps.some((dep) => dep.knip !== undefined)) {
        warnings.push('Прямая зависимость knip сохранена: проверьте конфликт версий с пресетом.');
    }

    // При повторном запуске не переписываем package.json, если настройки уже совпадают.
    if (original !== JSON.stringify(pkg)) {
        // Сохраняем отступы и переносы строк исходного файла.
        const indent = /^([ \t]+)"/m.exec(before)?.[1] ?? ' '.repeat(4);
        const newline = before.includes('\r\n') ? '\r\n' : '\n';
        const after = `${JSON.stringify(pkg, null, indent)}\n`.replaceAll('\n', newline);

        edits.push({ file: 'package.json', before, after });
    }
    return { edits, warnings };
}
