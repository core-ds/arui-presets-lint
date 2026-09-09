import { type Linter } from 'eslint';

import { requireDescriptionRule } from '../rule/index.js';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const disableCommentsPlugin = {
    rules: {
        'require-description': requireDescriptionRule,
    },
} as Linter.Config['plugins'];
