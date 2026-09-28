import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Строковое значение источника импорта/экспорта, либо null (не строка или нет source).
 */
export const getImportSourceString = (node: {
    source?: TSESTree.Expression | null;
}): string | null => {
    const { source } = node;

    if (source?.type !== AST_NODE_TYPES.Literal) return null;

    return typeof source.value === 'string' ? source.value : null;
};
