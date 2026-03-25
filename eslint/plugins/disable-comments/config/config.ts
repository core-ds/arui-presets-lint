import { type TSESLint } from '@typescript-eslint/utils';

import { disableCommentsPlugin } from './plugin';

/**
 * Config, который подключает плагин
 * и сразу включает правило с рекомендациями по умолчанию.
 */
export const disableCommentsConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/disable-comments',
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
