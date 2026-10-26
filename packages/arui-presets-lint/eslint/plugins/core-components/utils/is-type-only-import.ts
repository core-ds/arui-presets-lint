import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Является ли импорт целиком типовым (не тянет значения в рантайм).
 * Импорт без спецификаторов (side-effect) типовым не считается.
 */
export const isTypeOnlyImport = (node: TSESTree.ImportDeclaration): boolean => {
    if (node.importKind === 'type') {
        return true;
    }

    return (
        node.specifiers.length > 0 &&
        node.specifiers.every(
            (specifier) =>
                specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                specifier.importKind === 'type',
        )
    );
};
