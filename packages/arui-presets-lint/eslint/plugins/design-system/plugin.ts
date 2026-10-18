import { type TSESLint } from '@typescript-eslint/utils';

import { deprecatedApiRule } from './rules/no-deprecated-api.js';
import { annotatedComponentsRule } from './rules/no-deprecated-components.js';
import { deprecatedPropsRule } from './rules/no-deprecated-props.js';
import { accessibleNameRule } from './rules/require-accessible-name.js';

export const designSystemPlugin: TSESLint.FlatConfig.Plugin = {
    rules: {
        'no-deprecated-api': deprecatedApiRule,
        'no-deprecated-props': deprecatedPropsRule,
        'require-accessible-name': accessibleNameRule,
        'no-deprecated-components': annotatedComponentsRule,
    },
};
