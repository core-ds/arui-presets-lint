import { type ESLint, type Rule } from 'eslint';

import { coreComponentsImportRule } from '../rule/index.js';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const coreComponentsPlugin: ESLint.Plugin = {
    rules: {
        // TODO: старые типы контекста TSESLint; убрать после их адаптации к ESLint 10.
        'core-components-imports': coreComponentsImportRule as unknown as Rule.RuleModule,
    },
};
