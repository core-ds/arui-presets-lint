import { type ESLint, type Rule } from 'eslint';

import { requireDescriptionRule } from '../rule/index.js';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const disableCommentsPlugin: ESLint.Plugin = {
    rules: {
        // TODO: старые типы контекста TSESLint; убрать после их адаптации к ESLint 10.
        'require-description': requireDescriptionRule as unknown as Rule.RuleModule,
    },
};
