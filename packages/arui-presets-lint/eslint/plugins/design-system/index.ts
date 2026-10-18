import { AST_NODE_TYPES, type JSONSchema, TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { type Linter } from 'eslint';

import { GLOBAL_SCRIPTS_SCOPE, REACT_SCRIPTS_SCOPE } from '../../constants.js';

type Api = { module: string; export: string; replacement?: string; message?: string };
type Prop = {
    module: string;
    component: string;
    prop: string;
    replacement?: string;
    message?: string;
};
type Label = { module: string; component: string; labelProps?: string[]; allowSpread?: boolean };
type DeprecatedComponents = { modules?: string[] };
export type DesignSystemOptions = {
    deprecatedApis?: Api[];
    deprecatedProps?: Prop[];
    accessibleNames?: Label[];
    deprecatedComponents?: DeprecatedComponents | false;
};

const text = (node: TSESTree.Identifier | TSESTree.StringLiteral) =>
    node.type === AST_NODE_TYPES.Identifier ? node.name : node.value;

function importedName(specifier: TSESTree.ImportClause): string {
    switch (specifier.type) {
        case AST_NODE_TYPES.ImportSpecifier:
            return text(specifier.imported);
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
        // У eslint-scope нет isValueVariable; только явный false означает type-only binding.
        if (!variable || variable.isValueVariable === false) continue;
        // Импорт скрывают только значения: type и interface не затеняют JSX-компонент.
        const definition = variable.defs.find(
            (def) => def.type === TSESLint.Scope.DefinitionType.ImportBinding,
        );
        if (
            definition?.parent.type !== AST_NODE_TYPES.ImportDeclaration ||
            definition.node.type === AST_NODE_TYPES.TSImportEqualsDeclaration
        )
            return;
        return {
            module: definition.parent.source.value,
            export: importedName(definition.node),
        };
    }
}

function component(source: TSESLint.SourceCode, node: TSESTree.JSXOpeningElement) {
    let { name } = node;
    const members: string[] = [];
    while (name.type === AST_NODE_TYPES.JSXMemberExpression) {
        members.unshift(name.property.name);
        name = name.object;
    }
    if (name.type !== AST_NODE_TYPES.JSXIdentifier) return;
    const imported = binding(source, node, name.name);
    if (!imported || members.length === 0) return imported;
    return {
        module: imported.module,
        export: (imported.export === '*' ? members : [imported.export, ...members]).join('.'),
    };
}

const suggestion = (entry: { replacement?: string; message?: string }) =>
    [entry.replacement ? `Используйте ${entry.replacement}.` : '', entry.message ?? '']
        .filter(Boolean)
        .join(' ');

const schema = (
    required: string[],
    properties: Record<string, JSONSchema.JSONSchema4>,
): JSONSchema.JSONSchema4[] => [
    {
        type: 'array',
        items: { type: 'object', required, properties, additionalProperties: false },
    },
];
const string: JSONSchema.JSONSchema4 = { type: 'string', minLength: 1 };
const apiSchema = schema(['module', 'export'], {
    module: string,
    export: string,
    replacement: string,
    message: string,
});
const propsSchema = schema(['module', 'component', 'prop'], {
    module: string,
    component: string,
    prop: string,
    replacement: string,
    message: string,
});
const labelSchema = schema(['module', 'component'], {
    module: string,
    component: string,
    labelProps: { type: 'array', minItems: 1, uniqueItems: true, items: string },
    allowSpread: { type: 'boolean' },
});

// https://eslint.org/docs/latest/extend/custom-rules
const deprecatedApiRule: TSESLint.RuleModule<'deprecated', [Api[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: apiSchema,
        messages: { deprecated: 'API {{name}} из {{module}} устарел. {{suggestion}}' },
    },
    create(context) {
        const entries = context.options[0] ?? [];
        const report = (
            node: TSESTree.Node,
            imported: { module: string; export: string } | undefined,
        ) => {
            if (!imported) return;
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
                    if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) continue;
                    report(specifier, {
                        module: node.source.value,
                        export: importedName(specifier),
                    });
                }
            },
            ExportNamedDeclaration(node) {
                if (!node.source) return;
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
                if (node.object.type !== AST_NODE_TYPES.Identifier) return;
                const imported = binding(context.sourceCode, node, node.object.name);
                if (imported?.export !== '*') return;
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
                if (name) report(node, { module: imported.module, export: name });
            },
            JSXOpeningElement(node) {
                if (node.name.type === AST_NODE_TYPES.JSXMemberExpression)
                    report(node.name, component(context.sourceCode, node));
            },
        };
    },
};

const deprecatedPropsRule: TSESLint.RuleModule<'deprecatedProp', [Prop[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: propsSchema,
        messages: {
            deprecatedProp: 'Prop {{prop}} компонента {{component}} устарел. {{suggestion}}',
        },
    },
    create(context) {
        return {
            JSXOpeningElement(node) {
                const imported = component(context.sourceCode, node);
                if (!imported) return;
                for (const entry of context.options[0] ?? []) {
                    if (entry.module !== imported.module || entry.component !== imported.export)
                        continue;
                    for (const attribute of node.attributes) {
                        if (
                            attribute.type === AST_NODE_TYPES.JSXAttribute &&
                            attribute.name.type === AST_NODE_TYPES.JSXIdentifier &&
                            attribute.name.name === entry.prop
                        ) {
                            context.report({
                                node: attribute,
                                messageId: 'deprecatedProp',
                                data: {
                                    prop: entry.prop,
                                    component: entry.component,
                                    suggestion: suggestion(entry),
                                },
                            });
                        }
                    }
                }
            },
        };
    },
};

function hasLabelExpression(
    expression: TSESTree.Expression | TSESTree.JSXEmptyExpression,
): boolean {
    switch (expression.type) {
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
        case AST_NODE_TYPES.TSNonNullExpression:
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSInstantiationExpression:
            // Типовые обёртки не меняют значение в рантайме.
            return hasLabelExpression(expression.expression);
        case AST_NODE_TYPES.Literal:
            return typeof expression.value === 'string' && expression.value.trim().length > 0;
        case AST_NODE_TYPES.TemplateLiteral:
            return (
                expression.expressions.length > 0 ||
                (expression.quasis[0].value.cooked ?? expression.quasis[0].value.raw).trim()
                    .length > 0
            );
        case AST_NODE_TYPES.UnaryExpression:
            return expression.operator !== 'void';
        case AST_NODE_TYPES.JSXEmptyExpression:
            return false;
        case AST_NODE_TYPES.Identifier:
            return expression.name !== 'undefined';
        default:
            // Неизвестные динамические значения проверяются в рантайме.
            return true;
    }
}

function hasLabel(attribute: TSESTree.JSXAttribute): boolean {
    const { value } = attribute;
    if (!value) return false;
    if (value.type === AST_NODE_TYPES.JSXExpressionContainer) {
        return hasLabelExpression(value.expression);
    }
    return value.type === AST_NODE_TYPES.Literal && hasLabelExpression(value);
}

// https://www.w3.org/WAI/ARIA/apg/patterns/button/
const accessibleNameRule: TSESLint.RuleModule<'missingLabel', [Label[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: labelSchema,
        messages: { missingLabel: 'Компоненту {{component}} нужно доступное имя: {{props}}.' },
    },
    create(context) {
        return {
            JSXOpeningElement(node) {
                const imported = component(context.sourceCode, node);
                if (!imported) return;
                for (const entry of context.options[0] ?? []) {
                    if (entry.module !== imported.module || entry.component !== imported.export)
                        continue;
                    if (
                        entry.allowSpread &&
                        node.attributes.some(
                            (attr) => attr.type === AST_NODE_TYPES.JSXSpreadAttribute,
                        )
                    )
                        continue;
                    const props = entry.labelProps ?? ['aria-label', 'aria-labelledby'];
                    const hasName = node.attributes.some(
                        (attr) =>
                            attr.type === AST_NODE_TYPES.JSXAttribute &&
                            attr.name.type === AST_NODE_TYPES.JSXIdentifier &&
                            props.includes(attr.name.name) &&
                            hasLabel(attr),
                    );
                    if (!hasName)
                        context.report({
                            node,
                            messageId: 'missingLabel',
                            data: {
                                component: entry.component,
                                props: props.join(', '),
                            },
                        });
                }
            },
        };
    },
};

// SymbolFlags.Alias из публичного API TypeScript; используем маску без загрузки
// второй копии компилятора: checker и символы принадлежат parserServices проекта.
const aliasFlag = 2_097_152;
const annotatedComponentsRule: TSESLint.RuleModule<
    'deprecatedComponent' | 'missingTypes',
    [DeprecatedComponents]
> = {
    defaultOptions: [{}],
    meta: {
        type: 'problem',
        schema: [
            {
                type: 'object',
                additionalProperties: false,
                properties: {
                    modules: { type: 'array', minItems: 1, uniqueItems: true, items: string },
                },
            },
        ],
        messages: {
            deprecatedComponent:
                'Компонент {{component}} из {{module}} помечен @deprecated. {{description}}',
            missingTypes:
                'Для проверки @deprecated нужна информация TypeScript: включите projectService и добавьте файл в tsconfig.',
        },
    },
    create(context) {
        const services = context.sourceCode.parserServices;
        const program = services?.program;
        const map = services?.esTreeNodeToTSNodeMap;
        const checker = program?.getTypeChecker();
        const modules = context.options[0]?.modules ?? ['@alfalab/core-components', 'arui-private'];
        return {
            Program(node) {
                if (!checker || !map) context.report({ node, messageId: 'missingTypes' });
            },
            JSXOpeningElement(node) {
                if (!checker || !map) return;
                const imported = component(context.sourceCode, node);
                if (
                    !imported ||
                    !modules.some(
                        (root) =>
                            imported.module === root || imported.module.startsWith(`${root}/`),
                    )
                )
                    return;
                const tsNode = map.get(
                    node.name.type === AST_NODE_TYPES.JSXMemberExpression
                        ? node.name.property
                        : node.name,
                );
                let symbol = checker.getSymbolAtLocation(tsNode);
                if (!symbol) return;
                const seen = new Set<typeof symbol>();
                const aliasTags: ReturnType<typeof symbol.getJsDocTags> = [];
                // eslint-disable-next-line no-bitwise -- SymbolFlags TypeScript хранит признаки символа в битовой маске.
                while (symbol.flags & aliasFlag) {
                    if (seen.has(symbol)) return;
                    seen.add(symbol);
                    aliasTags.push(...symbol.getJsDocTags(checker));
                    // Аннотация может принадлежать реэкспорту, а не исходному компоненту.
                    const target = checker.getImmediateAliasedSymbol(symbol);
                    if (!target) return;
                    symbol = target;
                }
                const signatures = checker
                    .getTypeOfSymbolAtLocation(symbol, tsNode)
                    .getCallSignatures();
                const isOverloadedFunction =
                    signatures.length > 1 &&
                    signatures.some((signature) =>
                        symbol.declarations?.includes(signature.getDeclaration()),
                    );
                const signatureTags =
                    checker.getResolvedSignature(map.get(node))?.getJsDocTags() ?? [];
                // Теги функции объединяют аннотации всех перегрузок: проверяем выбранную JSX-сигнатуру.
                // У const учитываем и аннотацию всего компонента, и выбранную call signature.
                const tags = isOverloadedFunction
                    ? signatureTags
                    : [...symbol.getJsDocTags(checker), ...signatureTags];
                const deprecated = [...aliasTags, ...tags].find((tag) => tag.name === 'deprecated');
                if (!deprecated) return;
                const description = deprecated.text?.map((part) => part.text).join('') ?? '';
                context.report({
                    node: node.name,
                    messageId: 'deprecatedComponent',
                    data: {
                        component: imported.export,
                        module: imported.module,
                        description,
                    },
                });
            },
        };
    },
};

export const designSystemPlugin: TSESLint.FlatConfig.Plugin = {
    rules: {
        'no-deprecated-api': deprecatedApiRule,
        'no-deprecated-props': deprecatedPropsRule,
        'require-accessible-name': accessibleNameRule,
        'no-deprecated-components': annotatedComponentsRule,
    },
};

export function createDesignSystemConfig(options: DesignSystemOptions = {}): Linter.Config[] {
    return [
        {
            name: 'arui-presets-lint/design-system-plugin',
            plugins: {
                'design-system': designSystemPlugin as NonNullable<
                    Linter.Config['plugins']
                >[string],
            },
        },
        {
            name: 'arui-presets-lint/design-system-api',
            files: [GLOBAL_SCRIPTS_SCOPE],
            rules: { 'design-system/no-deprecated-api': ['error', options.deprecatedApis ?? []] },
        },
        {
            name: 'arui-presets-lint/design-system-jsx',
            files: [REACT_SCRIPTS_SCOPE],
            rules: {
                'design-system/no-deprecated-props': ['error', options.deprecatedProps ?? []],
                'design-system/require-accessible-name': ['error', options.accessibleNames ?? []],
            },
        },
        {
            name: 'arui-presets-lint/design-system-deprecated-components',
            files: ['**/*.{tsx,mtsx,ctsx}'],
            rules: {
                'design-system/no-deprecated-components':
                    options.deprecatedComponents === false
                        ? 'off'
                        : ['warn', options.deprecatedComponents ?? {}],
            },
        },
    ];
}
