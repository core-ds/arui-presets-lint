import { type TSESLint } from '@typescript-eslint/utils';

import { annotatedComponentsRule } from './rules/no-deprecated-components.js';

export const designSystemPlugin: TSESLint.FlatConfig.Plugin = {
    rules: {
        'no-deprecated-components': annotatedComponentsRule,
    },
};
