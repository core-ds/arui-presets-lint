import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { type Api } from '../types.js';
import { binding, component, importedName, schema, string, suggestion, text } from '../utils.js';

const apiSchema = schema(['module', 'export'], {
    module: string,
    export: string,
    replacement: string,
    message: string,
});

// https://eslint.org/docs/latest/extend/custom-rules
export const deprecatedApiRule: TSESLint.RuleModule<'deprecated', [Api[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: apiSchema,
        messages: { deprecated: 'API {{name}} из {{module}} устарел. {{suggestion}}' },
    },
    create(context) {
        const entries = context.options[0] ?? [];

        if (entries.length === 0) {
            return {};
        }

        const report = (
            node: TSESTree.Node,
            imported: { module: string; export: string } | undefined,
        ) => {
            if (!imported) {
                return;
            }

            for (const entry of entries) {
                if (entry.module === imported.module && entry.export === imported.export) {
                    context.report({
                        node,
                        messageId: 'deprecated',
                        data: {
                            name: imported.export,
                            module: imported.module,
                            suggestion: suggestion(entry),
                        },
                    });
                }
            }
        };

        return {
            ImportDeclaration(node) {
                for (const specifier of node.specifiers) {
                    if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
                        continue;
                    }

                    report(specifier, {
                        module: node.source.value,
                        export: importedName(specifier),
                    });
                }
            },

            ExportNamedDeclaration(node) {
                if (!node.source) {
                    return;
                }

                for (const specifier of node.specifiers) {
                    if (specifier.type === AST_NODE_TYPES.ExportSpecifier) {
                        report(specifier, {
                            module: node.source.value,
                            export: text(specifier.local),
                        });
                    }
                }
            },

            MemberExpression(node) {
                if (node.object.type !== AST_NODE_TYPES.Identifier) {
                    return;
                }

                const imported = binding(context.sourceCode, node, node.object.name);

                if (imported?.export !== '*') {
                    return;
                }

                let name: string | undefined;

                if (!node.computed && node.property.type === AST_NODE_TYPES.Identifier) {
                    name = node.property.name;
                } else if (
                    node.computed &&
                    node.property.type === AST_NODE_TYPES.Literal &&
                    typeof node.property.value === 'string'
                ) {
                    name = node.property.value;
                }

                if (name) {
                    report(node, { module: imported.module, export: name });
                }
            },

            JSXOpeningElement(node) {
                if (node.name.type === AST_NODE_TYPES.JSXMemberExpression) {
                    report(node.name, component(context.sourceCode, node));
                }
            },
        };
    },
};
