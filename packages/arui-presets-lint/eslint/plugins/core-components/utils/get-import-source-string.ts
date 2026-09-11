import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Нормализует источник импорта в строку-значение (путь модуля).
 * Принимает узел с полем `source`.
 * @param {TSESTree.Node & { source: TSESTree.Expression }} node - Узел импорта
 * @returns {string | null} Строковое значение пути, либо null, если источник не строка
 */
export const getImportSourceString = (
    node: TSESTree.Node & { source: TSESTree.Expression },
): string | null => {
    const { source } = node;

    if (source.type !== AST_NODE_TYPES.Literal) return null;

    return typeof source.value === 'string' ? source.value : null;
};
