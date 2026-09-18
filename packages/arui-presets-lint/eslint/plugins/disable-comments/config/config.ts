import { type Linter } from 'eslint';

import { GLOBAL_SCRIPTS_SCOPE } from '../../../constants.js';

import { disableCommentsPlugin } from './plugin.js';

/**
 * Config, который подключает плагин
 * и сразу включает правило с рекомендациями по умолчанию.
 */
export const disableCommentsConfig = {
    name: 'arui-presets-lint/disable-comments',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'disable-comments': disableCommentsPlugin,
    },
    rules: {
        'disable-comments/require-description': [
            'warn',
            {
                // при необходимости перечислите директивы‑исключения
                ignore: [],
            },
        ],
    },
} as Linter.Config;
