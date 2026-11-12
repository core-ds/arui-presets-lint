import { AST_NODE_TYPES, TSESLint, type TSESTree } from '@typescript-eslint/utils';

function importedName(specifier: TSESTree.ImportClause) {
    switch (specifier.type) {
        case AST_NODE_TYPES.ImportSpecifier:
            return specifier.imported.type === AST_NODE_TYPES.Identifier
                ? specifier.imported.name
                : specifier.imported.value;

        case AST_NODE_TYPES.ImportDefaultSpecifier:
            return 'default';

        case AST_NODE_TYPES.ImportNamespaceSpecifier:
            return '*';
    }
}

function binding(source: TSESLint.SourceCode, node: TSESTree.Node, name: string) {
    for (
        let scope: ReturnType<typeof source.getScope> | null = source.getScope(node);
        scope;
        scope = scope.upper
    ) {
        const variable = scope.set.get(name);

        // у eslint-scope нет isValueVariable; только явный false означает type-only binding
        if (!variable || variable.isValueVariable === false) {
            continue;
        }

        // в одной области видимости типовой импорт может иметь то же имя, что и локальное значение
        const definition = variable.defs.find((def) => {
            if (
                def.type === TSESLint.Scope.DefinitionType.ImportBinding &&
                def.parent.type === AST_NODE_TYPES.ImportDeclaration
            ) {
                return (
                    def.parent.importKind !== 'type' &&
                    (def.node.type !== AST_NODE_TYPES.ImportSpecifier ||
                        def.node.importKind !== 'type')
                );
            }

            return def.isVariableDefinition !== false;
        });

        if (!definition && variable.defs.length > 0) {
            continue;
        }

        if (
            definition?.type !== TSESLint.Scope.DefinitionType.ImportBinding ||
            definition.parent.type !== AST_NODE_TYPES.ImportDeclaration ||
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

    if (
        name.type !== AST_NODE_TYPES.JSXIdentifier ||
        (members.length === 0 && (/^[a-z]/.test(name.name) || name.name.includes('-')))
    ) {
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
