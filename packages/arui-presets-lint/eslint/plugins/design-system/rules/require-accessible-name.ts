import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { type Label } from '../types.js';
import { component, schema, string } from '../utils.js';

const labelSchema = schema(['module', 'component'], {
    module: string,
    component: string,
    labelProps: { type: 'array', minItems: 1, uniqueItems: true, items: string },
    allowSpread: { type: 'boolean' },
});

function hasLabelExpression(
    expression: TSESTree.Expression | TSESTree.JSXEmptyExpression,
): boolean {
    switch (expression.type) {
        case AST_NODE_TYPES.TSAsExpression:
        case AST_NODE_TYPES.TSTypeAssertion:
        case AST_NODE_TYPES.TSNonNullExpression:
        case AST_NODE_TYPES.TSSatisfiesExpression:
        case AST_NODE_TYPES.TSInstantiationExpression:
            // Типовые обертки не меняют значение в рантайме.
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

    if (!value) {
        return false;
    }

    if (value.type === AST_NODE_TYPES.JSXExpressionContainer) {
        return hasLabelExpression(value.expression);
    }

    return value.type === AST_NODE_TYPES.Literal && hasLabelExpression(value);
}

// https://www.w3.org/WAI/ARIA/apg/patterns/button/
export const accessibleNameRule: TSESLint.RuleModule<'missingLabel', [Label[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: labelSchema,
        messages: { missingLabel: 'Компоненту {{component}} нужно доступное имя: {{props}}.' },
    },
    create(context) {
        const entries = context.options[0] ?? [];

        if (entries.length === 0) {
            return {};
        }

        return {
            JSXOpeningElement(node) {
                const imported = component(context.sourceCode, node);

                if (!imported) {
                    return;
                }

                for (const entry of entries) {
                    if (entry.module !== imported.module || entry.component !== imported.export) {
                        continue;
                    }

                    if (
                        entry.allowSpread &&
                        node.attributes.some(
                            (attr) => attr.type === AST_NODE_TYPES.JSXSpreadAttribute,
                        )
                    ) {
                        continue;
                    }

                    const props = entry.labelProps ?? ['aria-label', 'aria-labelledby'];
                    const hasName = node.attributes.some(
                        (attr) =>
                            attr.type === AST_NODE_TYPES.JSXAttribute &&
                            attr.name.type === AST_NODE_TYPES.JSXIdentifier &&
                            props.includes(attr.name.name) &&
                            hasLabel(attr),
                    );

                    if (!hasName) {
                        context.report({
                            node,
                            messageId: 'missingLabel',
                            data: {
                                component: entry.component,
                                props: props.join(', '),
                            },
                        });
                    }
                }
            },
        };
    },
};
