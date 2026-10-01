import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Является ли экспорт целиком типовым (не тянет значения в рантайм).
 * `export * from` и `export * as ns from` типовыми не считаются: по синтаксису
 * они всегда рантайм (типовой вариант - `export type *`).
 */
export const isTypeOnlyExport = (
    node: TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration,
): boolean => {
    if (node.exportKind === 'type') {
        return true;
    }

    if (node.type !== AST_NODE_TYPES.ExportNamedDeclaration) {
        return false;
    }

    return (
        node.specifiers.length > 0 &&
        node.specifiers.every(
            (specifier) =>
                specifier.type === AST_NODE_TYPES.ExportSpecifier &&
                specifier.exportKind === 'type',
        )
    );
};
