import { type TSESLint } from '@typescript-eslint/utils';

import { requireDescriptionRule } from './rule';

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
            'warn',
            {
                ignore: [],
            },
        ],
    },
};
