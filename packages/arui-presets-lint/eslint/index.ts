import eslintJS from '@eslint/js';
import jsonPlugin from '@eslint/json';
import markdownPlugin from '@eslint/markdown';
import { type Linter } from 'eslint';
import gitignore from 'eslint-config-flat-gitignore';
import checkFilePlugin from 'eslint-plugin-check-file';
import deMorgan from 'eslint-plugin-de-morgan';
import { importX } from 'eslint-plugin-import-x';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import nodePlugin from 'eslint-plugin-n';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unicornPlugin from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { disableCommentsConfig, disableCommentsPlugin } from './plugins/index.js';
import { globalIgnores } from './config.js';
import { GLOBAL_SCRIPTS_SCOPE } from './constants.js';
import {
    bestPracticesConfig,
    checkFileConfig,
    importsConfig,
    jsonConfig,
    markdownConfig,
    nodeRulesConfig,
    reactA11yConfig,
    reactConfig,
    testsConfig,
    typescriptConfig,
    variablesConfig,
} from './rules.js';

export const eslintConfig = [
    gitignore({
        files: ['.gitignore', '.eslintignore'],
        strict: false,
    }),

    // ✋ Список игнора для ВСЕХ проектов использующих этот конфиг
    globalIgnores([
        '.yarn/**',
        'node_modules/**',
        '.pnp.*',
        'dist/**',
        'build/**',
        'coverage/**',
        '.cache/**',
        '.temp/**',
        '.tmp/**',
        '!.storybook',
    ]),
    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
            },
            globals: {
                ...globals.es2026,
                ...globals.browser,
            },
        },
        files: [GLOBAL_SCRIPTS_SCOPE],
        rules: {
            // https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js
            ...eslintJS.configs.recommended.rules,
        },
    },

    // ВСЕ плагины должны регистрироваться глобально
    // Иначе будут проблемы с переопределением
    {
        name: 'arui-presets-lint/plugins',
        plugins: {
            'import-x': importX,
            'simple-import-sort': simpleImportSortPlugin,
            'check-file': checkFilePlugin,
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            'jsx-a11y': jsxA11yPlugin,
            unicorn: unicornPlugin,
            'disable-comments': disableCommentsPlugin,
            '@typescript-eslint': tseslint.plugin,
            'de-morgan': deMorgan,
            n: nodePlugin,
            json: jsonPlugin,
            markdown: markdownPlugin,
        } as unknown as Linter.Config['plugins'],
    },

    /*
        ☭ Наши наборы правил ☭
    */
    bestPracticesConfig,
    nodeRulesConfig,
    reactConfig,
    reactA11yConfig,
    variablesConfig,
    testsConfig,
    typescriptConfig,
    importsConfig,
    disableCommentsConfig,
    jsonConfig,
    markdownConfig,
    checkFileConfig,
    /*
        ☭.
    */
] as Linter.Config;

export { defineConfig, globalIgnores, globals } from './config.js';
export * from './constants.js';

export { type Linter } from 'eslint';
export { type TSESLint } from '@typescript-eslint/utils';
