import { ESLint, type Linter } from 'eslint';
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, onTestFinished, vi } from 'vitest';

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

describe('многопоточный запуск ESLint', () => {
    // Собственный lint:scripts идёт с --concurrency off, а потребители получают auto:
    // проверяем, что конфиг пакета загружается и работает в worker-потоках
    it('проверяет файлы пакета в нескольких потоках', async () => {
        // На четырёх файлах потоки не окупаются, и ESLint печатает ESLintPoorConcurrencyWarning -
        // в выводе тестов это шум. ESLint запоминает emitWarning при создании, поэтому подменяем до него
        const warningSpy = vi.spyOn(process, 'emitWarning').mockReturnValue();
        onTestFinished(() => warningSpy.mockRestore());

        // Конфиг берётся из eslint.config.mts: опции с плагинами в потоки не передать
        const eslint = new ESLint({ cwd: packageRoot, concurrency: 2 });
        // JS, JSX, JSON и Markdown без TypeScript: анализ типов сделал бы тест медленным,
        // а загрузку всех плагинов пресета в потоках проверяют и эти файлы
        const files = ['prettier/index.js', 'test/js-input.jsx', 'package.json', 'README.md'];

        const results = await eslint.lintFiles(files.map((file) => path.join(packageRoot, file)));

        expect(results).toHaveLength(files.length);
        expect(results.every(({ fatalErrorCount }) => fatalErrorCount === 0)).toBe(true);
        // Глушим только ожидаемое предупреждение: любое другое должно уронить тест
        expect(warningSpy.mock.calls.map((call) => call[1] as unknown)).toEqual(
            warningSpy.mock.calls.map(() => 'ESLintPoorConcurrencyWarning'),
        );
    }, 30_000);
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

describe('React и доступность в итоговом пресете', () => {
    const eslint = new ESLint({
        cwd: packageRoot,
        overrideConfigFile: true,
        overrideConfig: defineConfig(eslintConfig, {
            // Проверяемым правилам React и доступности не нужен анализ типов TypeScript.
            languageOptions: { parserOptions: { projectService: false } },
        }),
        ruleFilter: ({ ruleId }) => /^(react-(x|dom|jsx)|jsx-a11y-x)\//u.test(ruleId),
    });

    // .jsx и .tsx разбирают разные парсеры: правила должны подключаться к обоим скоупам
    const scopeFiles = ['test/js-input.jsx', 'test/ts-input.tsx'];

    it.each(scopeFiles)('находит ошибки React и доступности в %s', async (filePath) => {
        const [result] = await eslint.lintText(
            `export const Example = () => (
                <main>
                    <a href="https://example.com" target="_blank">Link</a>
                    <button />
                    <img src="image.png" />
                    <span class="title" style="color: red">Text</span>
                </main>
            );`,
            { filePath },
        );

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages).toHaveLength(6);
        expect(result.messages.map(({ ruleId }) => ruleId)).toEqual(
            expect.arrayContaining([
                'react-dom/no-missing-button-type',
                'react-dom/no-string-style-prop',
                'react-dom/no-unknown-property',
                'react-dom/no-unsafe-target-blank',
                'jsx-a11y-x/alt-text',
                'jsx-a11y-x/control-has-associated-label',
            ]),
        );
    });

    it.each(scopeFiles)('принимает исправленные React и a11y атрибуты в %s', async (filePath) => {
        const [result] = await eslint.lintText(
            `export const Example = () => (
                <main>
                    <a href="https://example.com" target="_blank" rel="noreferrer">Link</a>
                    <button type="button">Send</button>
                    <img src="image.png" alt="Example" />
                    <span className="title" style={{ color: 'red' }}>Text</span>
                </main>
            );`,
            { filePath },
        );

        expect(result.messages).toEqual([]);
    });

    it('считает компоненты из settings jsx-a11y-x нативными элементами', async () => {
        const lintRuleIds = async (code: string) => {
            const [result] = await eslint.lintText(code, { filePath: 'test/js-input.jsx' });

            return result.messages.map(({ ruleId }) => ruleId);
        };
        // Button сопоставлен с <button> в настройках пресета: интерактивному элементу
        // нельзя назначать неинтерактивную роль. Несопоставленный компонент правило не видит
        const rule = 'jsx-a11y-x/no-interactive-element-to-noninteractive-role';

        expect(await lintRuleIds('export const A = () => <Button role="img" />;')).toContain(rule);
        expect(await lintRuleIds('export const A = () => <Unmapped role="img" />;')).not.toContain(
            rule,
        );
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
