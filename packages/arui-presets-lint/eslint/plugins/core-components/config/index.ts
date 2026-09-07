import { type TSESLint } from '@typescript-eslint/utils';

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
};

export { coreComponentsPlugin } from './plugin.js';
