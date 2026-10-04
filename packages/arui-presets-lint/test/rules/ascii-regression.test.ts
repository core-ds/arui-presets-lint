import { ESLint, type Linter } from 'eslint';
import path from 'node:path';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { defineConfig, eslintConfig } from '../../eslint/index.js';
import { checkFileConfig, variablesConfig } from '../../eslint/rules/index.js';

/* eslint-disable no-restricted-syntax -- Кириллица среди латиницы используется для проверки ASCII-правил. */

const packageRoot = path.resolve(import.meta.dirname, '../..');
const identifiersRuleId = 'ascii/no-non-ascii-identifiers';
const filenamesRuleId = 'ascii/no-non-ascii-filenames';

describe('отдельное подключение конфигов с ASCII-правилами', () => {
    it.each([
        {
            name: 'variablesConfig',
            config: variablesConfig,
            code: 'const vаlue = 1;',
            filePath: 'example.js',
            ruleId: identifiersRuleId,
        },
        {
            name: 'checkFileConfig',
            config: checkFileConfig,
            code: '',
            filePath: 'пример.js',
            ruleId: filenamesRuleId,
        },
    ])('$name регистрирует свой плагин', async ({ config, code, filePath, ruleId }) => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: config,
        });
        const [result] = await eslint.lintText(code, { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId === ruleId)).toHaveLength(1);
    });
});

describe('пользовательские форматы с non-ASCII путями', () => {
    it.each([
        ['example.custom', true],
        ['пример.custom', true],
        ['папка/example.custom', true],
        ['example.custom', false],
        ['пример.custom', false],
        ['папка/example.custom', false],
    ] as const)('сохраняет пользовательский парсер: %s, ASCII-проверка %s', async (filePath, checkFilename) => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig(eslintConfig, tseslint.configs.disableTypeChecked, {
                files: ['**/*.custom'],
                languageOptions: { parser: tseslint.parser },
                rules: {
                    'no-undef': 'error',
                    [filenamesRuleId]: checkFilename ? 'error' : 'off',
                    'check-file/folder-naming-convention': 'off',
                },
            }),
        });
        const [result] = await eslint.lintText('\r\n\r\nmissing();', { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId === 'no-undef')).toEqual([
            expect.objectContaining({ line: 3, column: 1, severity: 2 }),
        ]);
        expect(result.messages.filter((message) => message.ruleId === filenamesRuleId))
            .toHaveLength(checkFilename && filePath !== 'example.custom' ? 1 : 0);
    });

    it.each(['example.custom', 'пример.custom'])('сохраняет пользовательский язык: %s', async (filePath) => {
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig(eslintConfig, {
                files: ['**/*.custom'],
                language: 'json/json',
                rules: { 'json/no-duplicate-keys': 'error' },
            }),
        });
        const [result] = await eslint.lintText('{ "name": 1, "name": 2 }', { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId === 'json/no-duplicate-keys'))
            .toHaveLength(1);
    });

    it.each(['example.custom', 'пример.custom'])('сохраняет пользовательский процессор: %s', async (filePath) => {
        const processor: Linter.Processor = {
            preprocess(text) {
                return [{ text, filename: 'source.js' }];
            },
            postprocess(messages) {
                return messages.flat();
            },
        };
        const eslint = new ESLint({
            cwd: packageRoot,
            overrideConfigFile: true,
            overrideConfig: defineConfig(eslintConfig, tseslint.configs.disableTypeChecked, {
                files: ['**/*.custom'],
                processor,
                rules: { 'no-undef': 'error' },
            }),
        });
        const [result] = await eslint.lintText('missing();', { filePath });

        expect(result.fatalErrorCount).toBe(0);
        expect(result.messages.filter((message) => message.ruleId === 'no-undef')).toHaveLength(1);
    });
});
