import { type Linter } from 'eslint';

import { coreComponentsPlugin } from './plugin.js';

/**
 * Config, который подключает плагин core-components
 * и включает правило проверки платформенных импортов.
 */
export const coreComponentsConfig = {
    name: 'arui-presets-lint/core-components',
    plugins: {
        'core-components': coreComponentsPlugin,
    },
    rules: {
        'core-components/core-components-imports': 'warn',
    },
} as Linter.Config;
