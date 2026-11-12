import { type TSESLint } from '@typescript-eslint/utils';

import { CORE_COMPONENTS_PACKAGE } from '../../core-components/constants/index.js';
import { parseCoreComponentsSource } from '../../core-components/utils/parse-core-components-source.js';
import { getComponentDeprecation } from '../deprecation.js';
import { type DeprecatedComponents } from '../types.js';
import { component } from '../utils.js';

export const annotatedComponentsRule: TSESLint.RuleModule<
    'deprecatedComponent',
    [DeprecatedComponents]
> = {
    meta: {
        type: 'problem',
        schema: {
            type: 'array',
            minItems: 1,
            maxItems: 1,
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['modules'],
                properties: {
                    modules: {
                        type: 'array',
                        minItems: 1,
                        uniqueItems: true,
                        items: { type: 'string', minLength: 1 },
                    },
                },
            },
        },
        messages: {
            deprecatedComponent:
                'Компонент {{component}} из {{module}} помечен @deprecated. {{description}}',
        },
    },
    create(context) {
        const services = context.sourceCode.parserServices;
        const program = services?.program;
        const map = services?.esTreeNodeToTSNodeMap;

        if (!program || !map) {
            return {};
        }

        const checker = program.getTypeChecker();
        const { modules } = context.options[0];

        return {
            JSXOpeningElement(node) {
                const imported = component(context.sourceCode, node);

                if (
                    !imported ||
                    !modules.some((root) =>
                        root === CORE_COMPONENTS_PACKAGE
                            ? parseCoreComponentsSource(imported.module) !== null
                            : imported.module === root || imported.module.startsWith(`${root}/`),
                    )
                ) {
                    return;
                }

                const description = getComponentDeprecation(checker, map.get(node));

                if (description === undefined) {
                    return;
                }

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
