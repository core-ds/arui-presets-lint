import eslintJS from '@eslint/js';
import { type Linter } from 'eslint';
import gitignore from 'eslint-config-flat-gitignore';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

import { bestPracticesConfig } from './rules/best-practices';
// Локальные наборы правил
import { importsConfig } from './rules/imports';
import { nodeRulesConfig } from './rules/node';
import { reactConfig } from './rules/react';
import { reactA11yConfig } from './rules/react-a11y';
import { testsConfig } from './rules/tests';
import { typescriptConfig } from './rules/typescript';
import { variablesConfig } from './rules/variables';
import { globalIgnores } from './config';

export const eslintConfig = [
    gitignore({
        files: ['.gitignore', '.eslintignore'],
        strict: false,
    }),
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
    ]),
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: { jsx: true },
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
    bestPracticesConfig,
    nodeRulesConfig,
    reactConfig,
    reactA11yConfig,
    variablesConfig,
    testsConfig,
    typescriptConfig,
    importsConfig,

    // Совместимость с Prettier (отключает конфликтующие правила)
    // https://github.com/prettier/eslint-config-prettier/blob/main/index.js
    prettier,
] as Linter.Config;
