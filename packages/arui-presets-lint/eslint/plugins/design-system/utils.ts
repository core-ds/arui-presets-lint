import { AST_NODE_TYPES, type JSONSchema, TSESLint, type TSESTree } from '@typescript-eslint/utils';

export const text = (node: TSESTree.Identifier | TSESTree.StringLiteral) =>
    node.type === AST_NODE_TYPES.Identifier ? node.name : node.value;

export function importedName(specifier: TSESTree.ImportClause): string {
    switch (specifier.type) {
        case AST_NODE_TYPES.ImportSpecifier:
            return text(specifier.imported);

        case AST_NODE_TYPES.ImportDefaultSpecifier:
            return 'default';

        case AST_NODE_TYPES.ImportNamespaceSpecifier:
            return '*';
    }
}

export function binding(source: TSESLint.SourceCode, node: TSESTree.Node, name: string) {
    for (
        let scope: ReturnType<typeof source.getScope> | null = source.getScope(node);
        scope;
        scope = scope.upper
    ) {
        const variable = scope.set.get(name);

        // У eslint-scope нет isValueVariable; только явный false означает type-only binding.
        if (!variable || variable.isValueVariable === false) {
            continue;
        }

        // Импорт скрывают только значения: type и interface не затеняют JSX-компонент.
        const definition = variable.defs.find(
            (def) => def.type === TSESLint.Scope.DefinitionType.ImportBinding,
        );

        if (
            definition?.parent.type !== AST_NODE_TYPES.ImportDeclaration ||
            definition.node.type === AST_NODE_TYPES.TSImportEqualsDeclaration
        ) {
            return;
        }

        return {
            module: definition.parent.source.value,
            export: importedName(definition.node),
        };
    }
}

export function component(source: TSESLint.SourceCode, node: TSESTree.JSXOpeningElement) {
    let { name } = node;
    const members: string[] = [];

    while (name.type === AST_NODE_TYPES.JSXMemberExpression) {
        members.unshift(name.property.name);
        name = name.object;
    }

    if (name.type !== AST_NODE_TYPES.JSXIdentifier) {
        return;
    }

    const imported = binding(source, node, name.name);

    if (!imported || members.length === 0) {
        return imported;
    }

    return {
        module: imported.module,
        export: (imported.export === '*' ? members : [imported.export, ...members]).join('.'),
    };
}

export const suggestion = (entry: { replacement?: string; message?: string }) =>
    [entry.replacement ? `Используйте ${entry.replacement}.` : '', entry.message ?? '']
        .filter(Boolean)
        .join(' ');

export const schema = (
    required: string[],
    properties: Record<string, JSONSchema.JSONSchema4>,
): JSONSchema.JSONSchema4[] => [
    {
        type: 'array',
        items: { type: 'object', required, properties, additionalProperties: false },
    },
];

export const string: JSONSchema.JSONSchema4 = { type: 'string', minLength: 1 };
