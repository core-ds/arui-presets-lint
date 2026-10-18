import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';

import { type DeprecatedComponents } from '../types.js';
import { component, string } from '../utils.js';

// SymbolFlags.Alias из публичного API TypeScript; используем маску без загрузки
// второй копии компилятора: checker и символы принадлежат parserServices проекта.
const aliasFlag = 2_097_152;

export const annotatedComponentsRule: TSESLint.RuleModule<
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
                if (!checker || !map) {
                    context.report({ node, messageId: 'missingTypes' });
                }
            },

            JSXOpeningElement(node) {
                if (!checker || !map) {
                    return;
                }

                const imported = component(context.sourceCode, node);

                if (
                    !imported ||
                    !modules.some(
                        (root) =>
                            imported.module === root || imported.module.startsWith(`${root}/`),
                    )
                ) {
                    return;
                }

                const tsNode = map.get(
                    node.name.type === AST_NODE_TYPES.JSXMemberExpression
                        ? node.name.property
                        : node.name,
                );
                let symbol = checker.getSymbolAtLocation(tsNode);

                if (!symbol) {
                    return;
                }

                const seen = new Set<typeof symbol>();
                const aliasTags: ReturnType<typeof symbol.getJsDocTags> = [];

                // eslint-disable-next-line no-bitwise -- SymbolFlags TypeScript хранит признаки символа в битовой маске.
                while (symbol.flags & aliasFlag) {
                    if (seen.has(symbol)) {
                        return;
                    }

                    seen.add(symbol);
                    aliasTags.push(...symbol.getJsDocTags(checker));

                    // Аннотация может принадлежать реэкспорту, а не исходному компоненту.
                    const target = checker.getImmediateAliasedSymbol(symbol);

                    if (!target) {
                        return;
                    }

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

                if (!deprecated) {
                    return;
                }

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
