import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Является ли импорт целиком типовым (не тянет значения в рантайм).
 * Покрывает обе формы: `import type { X }` и `import { type X }`.
 * Импорт без спецификаторов (side-effect) типовым не считается.
 */
export const isTypeOnlyImport = (node: TSESTree.ImportDeclaration): boolean =>
    node.importKind === 'type' ||
    (node.specifiers.length > 0 &&
        node.specifiers.every(
            (specifier) =>
                specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                specifier.importKind === 'type',
        ));
