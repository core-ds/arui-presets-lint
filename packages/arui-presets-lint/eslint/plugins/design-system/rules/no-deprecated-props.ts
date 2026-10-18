import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

import { type Prop } from '../types.js';
import { component, schema, string, suggestion } from '../utils.js';

const propsSchema = schema(['module', 'component', 'prop'], {
    module: string,
    component: string,
    prop: string,
    replacement: string,
    message: string,
});

// https://eslint.org/docs/latest/extend/custom-rules
export const deprecatedPropsRule: TSESLint.RuleModule<'deprecatedProp', [Prop[]]> = {
    defaultOptions: [[]],
    meta: {
        type: 'problem',
        schema: propsSchema,
        messages: {
            deprecatedProp: 'Prop {{prop}} компонента {{component}} устарел. {{suggestion}}',
        },
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
