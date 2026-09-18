import { type Linter } from 'eslint';

import { GLOBAL_SCRIPTS_SCOPE } from '../../../constants.js';

import { coreComponentsPlugin } from './plugin.js';

/**
 * Config, который подключает плагин core-components
 * и включает правило проверки платформенных импортов.
 */
export const coreComponentsConfig = {
    name: 'arui-presets-lint/core-components',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'core-components': coreComponentsPlugin,
    },
    rules: {
        'core-components/core-components-imports': 'warn',
    },
} as Linter.Config;
