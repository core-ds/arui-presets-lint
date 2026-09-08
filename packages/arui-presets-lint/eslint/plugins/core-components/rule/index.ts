import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { CORE_COMPONENTS_PACKAGE, IMPORT_FORM } from '../constants/index.js';
import { type CoreComponentsImportRuleOptions } from '../types/index.js';
import { getSplitComponents, parseCoreComponentsSource } from '../utils/index.js';

export const coreComponentsImportRule: TSESLint.RuleModule<
    'missingPlatform',
    [CoreComponentsImportRuleOptions]
> = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Требует использовать платформенные импорты для компонентов core-components, у которых есть разделение на desktop/mobile. ' +
                'Поддерживаются обе формы импорта: через агрегатор (@alfalab/core-components/<pkg>/desktop или @alfalab/core-components/<pkg>/mobile) ' +
                'и через отдельный подпакет (@alfalab/core-components-<pkg>/desktop или @alfalab/core-components-<pkg>/mobile).',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    splitComponents: {
                        type: 'array',
                        items: { type: 'string' },
                        uniqueItems: true,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingPlatform:
                'Компонент "{{component}}" имеет разделение на desktop/mobile. ' +
                'Используйте платформенный импорт "{{suggestedDesktop}}" или "{{suggestedMobile}}" ' +
                'вместо импорта с корня пакета.',
        },
    },
    create(context) {
        const options = context.options[0] ?? {};

        // Разрешённый вручную список сплит-компонентов, либо список,
        // вычисленный по установленной в node_modules версии core-components.
        const manualSplitComponents = options.splitComponents
            ? new Set(options.splitComponents)
            : null;

        let runtimeSplitComponents: Set<string> | null = null;

        const getRuntimeSplitComponents = (): Set<string> => {
            runtimeSplitComponents ??= new Set(getSplitComponents(context.filename));

            return runtimeSplitComponents;
        };

        const reportIfWrongPlatform = (node: TSESTree.Node, sourceValue: string) => {
            const parsed = parseCoreComponentsSource(sourceValue);

            if (!parsed) return;

            // Импорт корня агрегатора без компонента - не можем определить сплит
            if (!parsed.component) return;

            const splitComponents = manualSplitComponents ?? getRuntimeSplitComponents();

            if (!splitComponents.has(parsed.component)) return;

            // Платформенный импорт - корректный вариант использования
            if (parsed.platform) return;

            // Базовый префикс под форму импорта: агрегатор '@alfalab/core-components/button'
            // или отдельный пакет '@alfalab/core-components-button'
            const packageBase =
                parsed.importForm === IMPORT_FORM.STANDALONE
                    ? `${CORE_COMPONENTS_PACKAGE}-${parsed.component}`
                    : `${CORE_COMPONENTS_PACKAGE}/${parsed.component}`;

            context.report({
                node,
                messageId: 'missingPlatform',
                data: {
                    component: parsed.component,
                    suggestedDesktop: `${packageBase}/desktop`,
                    suggestedMobile: `${packageBase}/mobile`,
                },
            });
        };

        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) => {
                const sourceValue = node.source.value;

                if (typeof sourceValue !== 'string') return;

                // Импорт только типов - не помечаем как ошибку, типы можно брать и с корня пакета.
                // Покрывает обе формы: `import type { X }` и `import { type X }`.
                const isTypeOnlyImport =
                    node.importKind === 'type' ||
                    (node.specifiers.length > 0 &&
                        node.specifiers.every(
                            (specifier) =>
                                specifier.type === AST_NODE_TYPES.ImportSpecifier &&
                                specifier.importKind === 'type',
                        ));

                if (isTypeOnlyImport) return;

                reportIfWrongPlatform(node, sourceValue);
            },
            ExportNamedDeclaration: (node: TSESTree.ExportNamedDeclaration) => {
                if (!node.source) return;

                const sourceValue = node.source.value;

                if (typeof sourceValue !== 'string') return;

                // Экспорт только типов - не помечаем как ошибку, типы можно брать и с корня пакета
                if (node.exportKind === 'type') return;

                reportIfWrongPlatform(node, sourceValue);
            },
            ExportAllDeclaration: (node: TSESTree.ExportAllDeclaration) => {
                const sourceValue = node.source.value;

                if (typeof sourceValue !== 'string') return;

                reportIfWrongPlatform(node, sourceValue);
            },
        };
    },
    defaultOptions: [{}],
};
