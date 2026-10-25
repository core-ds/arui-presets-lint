import { ESLint, type Linter } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import commitlintConfig from '../commitlint/index.js';
import { defineConfig, eslintConfig } from '../eslint/index.js';
import { reactHooksConfig } from '../eslint/rules/index.js';
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

        expectToMatchSnapshot(
            Object.keys(config.plugins ?? {}).toSorted((first, second) =>
                first.localeCompare(second),
            ),
            'plugins',
        );
        expectToMatchSnapshot(sortByKey(config.rules ?? {}), 'rules');
    });
});

describe('импорты devDependencies в монорепозитории', () => {
    it.each([
        { location: 'корня монорепозитория', cwd: path.resolve(packageRoot, '../..') },
        { location: 'каталога пакета', cwd: packageRoot },
    ])('сохраняет ограничения при запуске из $location', async ({ cwd }) => {
        const eslint = new ESLint({
            cwd,
            ruleFilter: ({ ruleId }) => ruleId === 'import-x/no-extraneous-dependencies',
            // Проверке путей devDependencies не нужен анализ типов TypeScript.
            overrideConfig: {
                languageOptions: {
                    parserOptions: { projectService: false },
                },
            },
        });
        const results = await eslint.lintFiles(
            ['test/configs.test.ts', 'test/rules/require-description.test.ts'].map((file) =>
                path.join(packageRoot, file),
            ),
        );

        expect(results).toHaveLength(2);
        expect(results.every(({ fatalErrorCount }) => fatalErrorCount === 0)).toBe(true);
        expect(
            results.flatMap(({ messages }) =>
                messages.filter(({ ruleId }) => ruleId === 'import-x/no-extraneous-dependencies'),
            ),
        ).toEqual([]);

        const [productionResult] = await eslint.lintText(
            "import { describe } from 'vitest'; export { describe };",
            { filePath: path.join(packageRoot, 'src/no-dev-dependency.js') },
        );

        expect(productionResult.fatalErrorCount).toBe(0);
        expect(
            productionResult.messages.filter(
                ({ ruleId }) => ruleId === 'import-x/no-extraneous-dependencies',
            ),
        ).toEqual([expect.objectContaining({ severity: 2, messageId: 'devDep' })]);
    });
});

describe('подключение публичных ESLint-конфигов', () => {
    it('принимает базовый конфиг из руководства по установке', async () => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig(eslintConfig),
        });
        const [result] = await eslint.lintText(
            `import { defineConfig, eslintConfig } from 'arui-presets-lint/eslint';

            export default defineConfig(eslintConfig);`,
            { filePath: 'eslint.config.mts' },
        );

        expect(result.messages).toEqual([]);
    });

    it('подключает публичный конфиг Hooks отдельно от общего пресета', async () => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig(reactHooksConfig),
        });

        const config: unknown = await eslint.calculateConfigForFile('prettier/index.js');

        expect(config).toHaveProperty(['plugins', 'react-x']);
        expect(config).toMatchObject({
            rules: {
                'react-x/rules-of-hooks': [2],
                'react-x/exhaustive-deps': [2],
            },
        });
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

    it('lefthook', () => {
        expectToMatchSnapshot(
            fs.readFileSync(path.join(packageRoot, 'lefthook/index.yml'), 'utf8'),
        );
    });
});
