import { type TSESLint } from '@typescript-eslint/utils';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { GLOBAL_SCRIPTS_SCOPE } from '../../../constants.js';

import { coreComponentsPlugin } from './plugin.js';

export type { TSESLint };

/**
 * Config, который подключает плагин core-components
 * и включает правило проверки платформенных импортов.
 */
export const coreComponentsConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/core-components',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'core-components': coreComponentsPlugin,
    },
    rules: {
        'core-components/core-components-imports': 'error',
    },
    languageOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: {
            projectService: true,
            ecmaFeatures: { jsx: true },
        },
        globals: {
            ...globals.es2026,
            ...globals.browser,
            ...globals.node,
        },
    },
};

export { coreComponentsPlugin } from './plugin.js';
