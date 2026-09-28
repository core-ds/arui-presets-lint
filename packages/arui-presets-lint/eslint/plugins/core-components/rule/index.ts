import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { CORE_COMPONENTS_PACKAGE } from '../constants/index.js';
import { type CoreComponentsImportRuleOptions } from '../types/index.js';
import {
    getImportSourceString,
    getSplitComponents,
    isTypeOnlyExport,
    isTypeOnlyImport,
    parseCoreComponentsSource,
} from '../utils/index.js';

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
                    excludeSplitComponents: {
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

        // Ручной список компонентов разделенных на платформы: полностью заменяет автоопределение.
        const manualSplitComponents = options.splitComponents
            ? new Set(options.splitComponents)
            : null;

        // Компоненты, исключённые из проверки. Вычитаются и из ручного списка, и из автоопределения.
        const excludedSplitComponents = options.excludeSplitComponents;

        let effectiveSplitComponents: Set<string> | undefined;

        const getEffectiveSplitComponents = (): Set<string> => {
            if (effectiveSplitComponents) return effectiveSplitComponents;

            const splitComponents =
                manualSplitComponents ?? new Set(getSplitComponents(context.filename));

            if (excludedSplitComponents) {
                for (const component of excludedSplitComponents) {
                    splitComponents.delete(component);
                }
            }

            effectiveSplitComponents = splitComponents;

            return effectiveSplitComponents;
        };

        const reportIfWrongPlatform = (node: TSESTree.Node, sourceValue: string) => {
            const parsed = parseCoreComponentsSource(sourceValue);

            if (!parsed) return;

            if (!parsed.component) return;

            const splitComponents = getEffectiveSplitComponents();

            if (!splitComponents.has(parsed.component)) return;

            if (parsed.platform) return;

            const packageBase =
                parsed.importForm === 'standalone'
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

        const checkSource = (
            node:
                | TSESTree.ImportDeclaration
                | TSESTree.ImportExpression
                | TSESTree.ExportNamedDeclaration
                | TSESTree.ExportAllDeclaration,
            isTypeOnly: boolean,
        ) => {
            const sourceValue = getImportSourceString(node);

            if (sourceValue === null) return;

            // Типы можно брать и с корня пакета
            if (isTypeOnly) return;

            reportIfWrongPlatform(node, sourceValue);
        };

        return {
            ImportDeclaration: (node: TSESTree.ImportDeclaration) =>
                checkSource(node, isTypeOnlyImport(node)),
            ImportExpression: (node: TSESTree.ImportExpression) => checkSource(node, false),
            ExportNamedDeclaration: (node: TSESTree.ExportNamedDeclaration) =>
                checkSource(node, isTypeOnlyExport(node)),
            ExportAllDeclaration: (node: TSESTree.ExportAllDeclaration) =>
                checkSource(node, isTypeOnlyExport(node)),
        };
    },
    defaultOptions: [{}],
};
