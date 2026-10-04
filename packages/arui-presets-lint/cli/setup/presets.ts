import { createRequire } from 'node:module';
import path from 'node:path';

import { isRecord, type Manifest } from './types.js';

const presetConfigs = [
    { key: 'prettier', path: 'arui-presets-lint/prettier' },
    { key: 'stylelint', path: 'arui-presets-lint/stylelint' },
    { key: 'commitlint', path: './node_modules/arui-presets-lint/commitlint' },
] as const;

function resolveCommitlintPreset(cwd: string, fallback: string): string {
    // Commitlint добавляет префикс к имени пакета: наш пресет подключаем по пути.
    const require = createRequire(path.join(path.resolve(cwd), 'package.json'));

    // Пакет может быть установлен в node_modules родительского каталога.
    for (const directory of require.resolve.paths('arui-presets-lint') ?? []) {
        const preset = path.join(directory, 'arui-presets-lint/commitlint');
        try {
            require.resolve(preset);
            // Оставляем путь через node_modules, без привязки к внутреннему хранилищу пакетов.
            const relative = path.relative(cwd, preset).split(path.sep).join('/');
            return relative.startsWith('.') ? relative : `./${relative}`;
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'MODULE_NOT_FOUND') throw error;
        }
    }

    // Если пакет ещё не установлен, используем обычный путь к локальной node_modules.
    return fallback;
}

function migratePresetPath(value: unknown, key: string, presetPath: string): unknown {
    // Меняем только известные пути к нашему пресету; чужие настройки сохраняем.
    const normalized = (entry: unknown) =>
        typeof entry === 'string' &&
        entry.replace(/^\.\/node_modules\//, '').replace(/\/index\.js$/, '') ===
            `arui-presets-lint/${key}`
            ? presetPath
            : entry;

    if (typeof value === 'string') {
        return normalized(value);
    }

    if (!isRecord(value) || value.extends === undefined) {
        return value;
    }

    return {
        ...value,
        extends: Array.isArray(value.extends)
            ? value.extends.map(normalized)
            : normalized(value.extends),
    };
}

export function planPresets(
    cwd: string,
    pkg: Manifest,
    externalConfigs: Set<string>,
    migrate: boolean,
): void {
    for (const { key, path: presetPath } of presetConfigs) {
        if (externalConfigs.has(key)) {
            continue;
        }

        const target = key === 'commitlint' ? resolveCommitlintPreset(cwd, presetPath) : presetPath;

        if (pkg[key] === undefined) {
            pkg[key] = key === 'prettier' ? target : { extends: target };
        } else if (migrate) {
            pkg[key] = migratePresetPath(pkg[key], key, target);
        }
    }
}
