import { type TSESLint } from '@typescript-eslint/utils';

import { GLOBAL_SCRIPTS_SCOPE } from '../../../constants.js';

import { disableCommentsPlugin } from './plugin.js';

/**
 * Config, который подключает плагин
 * и сразу включает правило с рекомендациями по умолчанию.
 */
export const disableCommentsConfig: TSESLint.FlatConfig.Config = {
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
};
