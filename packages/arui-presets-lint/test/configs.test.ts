import { ESLint, type Linter } from 'eslint';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import commitlintConfig from '../commitlint/index.js';
import { defineConfig, eslintConfig } from '../eslint/index.js';
import knipConfig from '../knip/index.js';
import prettierConfig from '../prettier/index.js';
import stylelintConfig from '../stylelint/index.js';

// Снапшоты фиксируют итоговое содержимое конфигов: бамп плагина, который переименовал,
// выключил или поменял дефолты правил, проявится диффом снапшота, а не сюрпризом
// у потребителей

const updateSnapshotsHint = [
    'Если изменение конфига намеренное - обновите снапшоты командой (из корня монорепы):',
    'yarn workspace arui-presets-lint test:unit -u',
].join('\n');

// Обёртка над toMatchSnapshot: при падении дописывает в ошибку команду обновления снапшотов
const expectToMatchSnapshot = (value: unknown, name?: string) => {
    try {
        if (name) {
            expect(value).toMatchSnapshot(name);
        } else {
            expect(value).toMatchSnapshot();
        }
    } catch (error) {
        if (error instanceof Error) {
            error.message = `${error.message}\n\n${updateSnapshotsHint}`;
        }

        throw error;
    }
};

const packageRoot = path.resolve(import.meta.dirname, '..');

const sortByKey = (target: Partial<Linter.RulesRecord>) =>
    Object.fromEntries(
        Object.entries(target).toSorted(([first], [second]) => (first > second ? 1 : -1)),
    );

describe('итоговый резолв конфига eslint', () => {
    const eslint = new ESLint({
        cwd: packageRoot,
        overrideConfigFile: true,
        overrideConfig: defineConfig(eslintConfig),
    });

    // Представительный файл каждого скоупа конфига
    const scopeFiles = [
        'src/components/some-component.tsx',
        'src/utils/helpers.ts',
        'src/utils/helpers.test.ts',
        'scripts/build.mjs',
        'docs/guide.md',
        'configs/settings.json',
    ];

    it.each(scopeFiles)('%s', async (file) => {
        const config = (await eslint.calculateConfigForFile(
            path.join(packageRoot, file),
        )) as Linter.Config;

        expectToMatchSnapshot(Object.keys(config.plugins ?? {}).toSorted(), 'plugins');
        expectToMatchSnapshot(sortByKey(config.rules ?? {}), 'rules');
    });
});

describe('статические конфиги', () => {
    it('prettier', () => {
        expectToMatchSnapshot(prettierConfig);
    });

    it('stylelint', () => {
        expectToMatchSnapshot(stylelintConfig);
    });

    it('commitlint', () => {
        expectToMatchSnapshot(commitlintConfig);
    });

    it('knip', () => {
        expectToMatchSnapshot(knipConfig);
    });
});
