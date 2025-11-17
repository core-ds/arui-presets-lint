import { type TSESLint } from '@typescript-eslint/utils';

import { requireDescriptionRule } from './customs/require-description';

export const disableCommentsConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/disable-comments',
    plugins: {
        'disable-comments': {
            rules: {
                'require-description': requireDescriptionRule,
            },
        },
    },
    rules: {
        'disable-comments/require-description': [
            'error',
            {
                ignore: [],
            },
        ],

        // Дополнительные правила для disable комментариев
        'no-restricted-syntax': [
            'error',
            {
                selector: 'Program > :not(ExpressionStatement) BlockComment',
                message: 'Блочные комментарии разрешены только внутри выражений',
            },
        ],
    },
};
