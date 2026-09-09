import { type Linter } from 'eslint';

import { coreComponentsImportRule } from '../rule/index.js';

/**
 * Плагин, который можно импортировать отдельно.
 * Содержит лишь набор правил, без их активации.
 */
export const coreComponentsPlugin = {
    rules: {
        'core-components-imports': coreComponentsImportRule,
    },
} as Linter.Config['plugins'];
