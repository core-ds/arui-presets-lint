import eslintJS from '@eslint/js';
import { type Linter } from 'eslint';
import gitignore from 'eslint-config-flat-gitignore';
import globals from 'globals';

import { globalIgnores } from './config';
import {
    bestPracticesConfig,
    importsConfig,
    nodeRulesConfig,
    reactA11yConfig,
    reactConfig,
    testsConfig,
    typescriptConfig,
    variablesConfig,
} from './rules';

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
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
                projectService: {
                    // Разрешаем линтить файлы в корне проекта, даже если они не включены в tsconfig.json
                    // ⛔️ Внимание, включить '**' тут нельзя, влияет на производительность!
                    // https://typescript-eslint.io/packages/parser/#allowdefaultproject
                    allowDefaultProject: ['*.js', '*.ts', '*.mjs', '*.mts', '*.cts', '*.cjs'],
                },
            },
            globals: {
                ...globals.es2022,
                ...globals.browser,
                ...globals.node,
            },
        },
        files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    },

    // https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js
    eslintJS.configs.recommended,

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
    /*
        ☭.
    */

    {
        // Включаем проверку других расширений файлов в eslint-plugin-check-file
        // ⚠️ НЕ ДОЛЖНО ПЕРЕСЕКАТЬСЯ С ПАТТЕРНОМ, УКАЗАННЫМ ВЫШЕ
        files: ['**/*.{yaml,yml,json}'],
        processor: 'check-file/eslint-processor-check-file',
    },
] as Linter.Config;

export { type Linter } from 'eslint';
export { type TSESLint } from '@typescript-eslint/utils';
