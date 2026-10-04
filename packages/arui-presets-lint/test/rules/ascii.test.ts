import { ESLint } from 'eslint';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { defineConfig, eslintConfig } from '../../eslint/index.js';
import { asciiPlugin } from '../../eslint/plugins/index.js';

/* eslint-disable no-restricted-syntax -- Проверяем намеренные смеси кириллицы и латиницы в тестовых данных. */

const packageRoot = path.resolve(import.meta.dirname, '../..');
const identifiersRuleId = 'ascii/no-non-ascii-identifiers';
const filenamesRuleId = 'ascii/no-non-ascii-filenames';

const identifiersEslint = new ESLint({
    cwd: packageRoot,
    overrideConfigFile: true,
    overrideConfig: {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { ascii: asciiPlugin },
        rules: { [identifiersRuleId]: 'error' },
    },
});

// Проверяем подключение правил в реальном пресете без создания TS-проекта для фикстур.
const presetEslint = new ESLint({
    cwd: packageRoot,
    overrideConfigFile: true,
    overrideConfig: defineConfig(eslintConfig, tseslint.configs.disableTypeChecked),
});

describe('ASCII в идентификаторах', () => {
    it.each([
        'const value = 1; const $value = value; const _value = $value;',
        'const { snake_case: snakeCase, "имя": name } = source;',
        'const message = "Привет"; // Русский комментарий',
        'const data = { "имя": "значение" }; data["имя"];',
        'class Example { #value = 1; method(parameter) { return parameter; } }',
        'import { "имя" as name } from "module";',
        'const view = <Component title="Привет">Текст</Component>;',
        'type Example<TValue> = { "имя": TValue };',
        String.raw`const v\u0061lue = 1;`,
    ])('принимает ASCII-имена и текст: %s', async (code) => {
        const [result] = await identifiersEslint.lintText(code, { filePath: 'example.tsx' });

        expect(result.messages).toEqual([]);
    });

    it.each([
        ['кириллическая переменная', 'const имя = 1;', 'имя'],
        ['похожий символ в латинском имени', 'const vаlue = 1;', 'vаlue'],
        ['диакритика', 'const café = 1;', 'café'],
        ['комбинируемый символ', 'const cafe\u0301 = 1;', 'cafe\u0301'],
        ['символ вне BMP', 'const 𝒜 = 1;', '𝒜'],
        ['нулевая ширина', 'const val\u200Cue = 1;', 'val\u200Cue'],
        ['греческая буква', 'const vαlue = 1;', 'vαlue'],
        ['namespace-импорт', 'import * as имя from "module";', 'имя'],
        ['namespace TypeScript', 'namespace Имя {}', 'Имя'],
        ['Unicode escape', String.raw`const v\u0430lue = 1;`, 'vаlue'],
        ['функция', 'function имя() {}', 'имя'],
        ['параметр', 'function example(имя) {}', 'имя'],
        ['параметр catch', 'try {} catch (ошибка) {}', 'ошибка'],
        ['локальный импорт', 'import { name as имя } from "module";', 'имя'],
        ['default-импорт', 'import Имя from "module";', 'Имя'],
        ['деструктуризация', 'const { name: имя } = source;', 'имя'],
        ['свойство объекта', 'const object = { имя: 1 };', 'имя'],
        ['доступ к свойству', 'object.имя;', 'имя'],
        ['вызов метода', 'object.имя();', 'имя'],
        ['имя класса', 'class Имя {}', 'Имя'],
        ['метод класса', 'class Example { имя() {} }', 'имя'],
        ['поле класса', 'class Example { имя = 1; }', 'имя'],
        ['приватное поле', 'class Example { #имя = 1; }', 'имя'],
        ['JSX-компонент', 'const view = <Компонент />;', 'Компонент'],
        ['JSX-атрибут', 'const view = <Component имя="value" />;', 'имя'],
        ['интерфейс', 'interface Имя {}', 'Имя'],
        ['тип', 'type Имя = string;', 'Имя'],
        ['параметр типа', 'type Example<Имя> = string;', 'Имя'],
        ['поле типа', 'type Example = { имя: string };', 'имя'],
        ['enum', 'enum Имя { Value }', 'Имя'],
        ['элемент enum', 'enum Example { Имя }', 'Имя'],
    ])('отклоняет non-ASCII: %s', async (_description, code, name) => {
        const [result] = await identifiersEslint.lintText(code, { filePath: 'example.tsx' });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0]).toMatchObject({
            ruleId: identifiersRuleId,
            severity: 2,
            messageId: 'nonAsciiIdentifier',
            message: `Идентификатор "${name}" содержит символы вне ASCII.`,
        });
        expect(result.output).toBeUndefined();
    });

    it('не дублирует сообщение для shorthand-свойства', async () => {
        const [result] = await identifiersEslint.lintText('const object = { имя };', {
            filePath: 'example.js',
        });

        expect(result.messages).toHaveLength(1);
    });

    it.each(['js', 'mjs', 'cjs', 'jsx', 'ts', 'mts', 'cts', 'tsx'])(
        'правило включено в пресете для .%s',
        async (extension) => {
            const [result] = await presetEslint.lintText('const vаlue = 1;', {
                filePath: `example.${extension}`,
            });

            expect(result.fatalErrorCount).toBe(0);
            expect(
                result.messages.filter((message) => message.ruleId === identifiersRuleId),
            ).toHaveLength(1);
        },
    );
});

describe('ASCII в именах файлов и папок', () => {
    it.each([
        ['пример.js', ''],
        ['example.тест.ts', ''],
        ['example.module.сss', ''],
        ['пример.md', '# Заголовок'],
        ['пример.json', '{}'],
        ['пример.jsonc', '{}'],
        ['пример.css', ''],
        ['пример.svg', '<svg />'],
        ['пример.png', ''],
        ['пример.txt', 'Текст'],
        ['.пример', 'Текст'],
        ['папка/CHANGELOG.md', '# Заголовок'],
        ['папка/example.unknown', 'Текст'],
        ['.папка/example.unknown', 'Текст'],
        ['папка/example', 'Текст'],
        ['папка/example.js', ''],
        ['src/папка/example.ts', ''],
        ['.папка/example.js', ''],
        ['папка/example.json', '{}'],
        ['папка/example.md', '# Заголовок'],
        ['папка/example.css', ''],
        ['café.js', ''],
        ['cafe\u0301.js', ''],
        ['😀.svg', '<svg />'],
    ])('отклоняет путь %s', async (filePath, code) => {
        const [result] = await presetEslint.lintText(code, { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId === filenamesRuleId)).toEqual([
            expect.objectContaining({ severity: 2, messageId: 'nonAsciiFilename' }),
        ]);
    });

    it.each([
        ['src/example.test.ts', ''],
        ['src/example.module.css', ''],
        ['docs/guide.md', '# Заголовок'],
        ['configs/settings.json', '{ "имя": "значение" }'],
        ['assets/example.svg', '<svg />'],
    ])('принимает ASCII-путь %s', async (filePath, code) => {
        const [result] = await presetEslint.lintText(code, { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId?.startsWith('ascii/'))).toEqual(
            [],
        );
    });

    it('проверяет физическое имя файла при работе процессора', async () => {
        const [result] = await presetEslint.lintText('', { filePath: 'assets/example.тест.css' });

        expect(result.messages.filter((message) => message.ruleId === filenamesRuleId)).toEqual([
            expect.objectContaining({
                message: 'Имя файла или папки "example.тест.css" содержит символы вне ASCII.',
            }),
        ]);
    });

    it('не проверяет имя каталога, в котором находится проект', async () => {
        const cwd = path.join(packageRoot, 'проект');
        const eslint = new ESLint({
            cwd,
            overrideConfigFile: true,
            overrideConfig: {
                plugins: { ascii: asciiPlugin },
                rules: { [filenamesRuleId]: 'error' },
            },
        });
        const [result] = await eslint.lintText('', { filePath: path.join(cwd, 'example.js') });

        expect(result.messages).toEqual([]);
    });

    it('принимает текст без имени файла', async () => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: {
                plugins: { ascii: asciiPlugin },
                rules: { [filenamesRuleId]: 'error' },
            },
        });
        const [result] = await eslint.lintText('');

        expect(result.messages).toEqual([]);
    });

    it('не проверяет файлы, исключённые проектом', async () => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig({ ignores: ['ignored/**'] }, eslintConfig),
            warnIgnored: false,
        });
        const results = await eslint.lintText('', { filePath: 'ignored/пример.txt' });

        expect(results).toEqual([]);
    });

    it('находит ошибки при обходе проекта, включая неизвестные расширения и файлы без них', async () => {
        const cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'ascii-проект-'));

        try {
            const files = {
                'src/example.js': 'const value = 1;',
                'src/example.ts': 'const vаlue = 1;',
                'docs/описание.md': '# Заголовок',
                'assets/example.тест.css': '',
                'misc/пример.unknown': 'Текст',
                'папка/example': 'Текст',
                'ignored/пример.txt': 'Текст',
            };

            await Promise.all(
                Object.entries(files).map(async ([file, code]) => {
                    const filename = path.join(cwd, file);

                    await fs.mkdir(path.dirname(filename), { recursive: true });
                    await fs.writeFile(filename, code);
                }),
            );

            const eslint = new ESLint({
                cwd,
                overrideConfigFile: true,
                overrideConfig: defineConfig(
                    { ignores: ['ignored/**'] },
                    eslintConfig,
                    tseslint.configs.disableTypeChecked,
                ),
            });
            const results = await eslint.lintFiles('.');
            const errors = results.flatMap((result) =>
                result.messages
                    .filter((message) => message.ruleId?.startsWith('ascii/'))
                    .map((message) => ({
                        file: path.relative(cwd, result.filePath).split(path.sep).join('/'),
                        ruleId: message.ruleId,
                    })),
            );

            expect(results.every((result) => result.fatalErrorCount === 0)).toBe(true);
            expect(errors).toHaveLength(5);
            expect(errors).toEqual(
                expect.arrayContaining([
                    { file: 'src/example.ts', ruleId: identifiersRuleId },
                    { file: 'docs/описание.md', ruleId: filenamesRuleId },
                    { file: 'assets/example.тест.css', ruleId: filenamesRuleId },
                    { file: 'misc/пример.unknown', ruleId: filenamesRuleId },
                    { file: 'папка/example', ruleId: filenamesRuleId },
                ]),
            );
        } finally {
            await fs.rm(cwd, { recursive: true, force: true });
        }
    });
});
