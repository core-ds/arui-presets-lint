import { type TSESLint } from '@typescript-eslint/utils';

import { coreComponentsImportRule } from '../rule/index.js';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const coreComponentsPlugin: TSESLint.FlatConfig.Plugin = {
    rules: {
        'core-components-imports': coreComponentsImportRule,
    },
};
