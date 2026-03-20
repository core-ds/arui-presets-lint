import { type TSESLint } from '@typescript-eslint/utils';

import { requireDescriptionRule } from '../rule';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const disableCommentsPlugin: TSESLint.FlatConfig.Plugin = {
    rules: {
        'require-description': requireDescriptionRule,
    },
};
