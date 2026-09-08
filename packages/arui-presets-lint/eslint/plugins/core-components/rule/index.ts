import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import {
    CORE_COMPONENTS_PACKAGE,
    type CoreComponentsImportForm,
    IMPORT_FORM,
    STANDALONE_PREFIX,
} from '../constants.js';
import { getSplitComponents } from '../scanner.js';
import { type CoreComponentsImportRuleOptions } from '../types.js';

type ParsedSource = {
    component: string;
    platform: string | null;
    importForm: CoreComponentsImportForm;
};

/**
 * Извлекает имя компонента и платформенный суффикс из модуля агрегатора
 * или из отдельного подпакета @alfalab/core-components-<pkg>.
 * Например:
 *   '@alfalab/core-components/button/desktop' -> { component: 'button', platform: 'desktop', form: 'aggregator' }
 *   '@alfalab/core-components-button/desktop' -> { component: 'button', platform: 'desktop', form: 'standalone' }
 */
const parseCoreComponentsSource = (source: string): ParsedSource | null => {
    if (source === CORE_COMPONENTS_PACKAGE) {
        return { component: '', platform: null, importForm: IMPORT_FORM.AGGREGATOR };
    }

    // Ветка отдельного подпакета: '@alfalab/core-components-<pkg>[/platform]'
    if (source.startsWith(STANDALONE_PREFIX)) {
        const normalized = source
            .slice(STANDALONE_PREFIX.length)
            .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
            .replace(/\/index$/, '');
        const [component, platform] = normalized.split('/');

        return { component, platform: platform ?? null, importForm: IMPORT_FORM.STANDALONE };
    }

    const prefix = `${CORE_COMPONENTS_PACKAGE}/`;

    // Ветка агрегатора: '@alfalab/core-components/<pkg>[/platform]'
    if (!source.startsWith(prefix)) return null;

    const normalized = source
        .slice(prefix.length)
        .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
        .replace(/\/index$/, '');
    const [component, platform] = normalized.split('/');

    return { component, platform: platform ?? null, importForm: IMPORT_FORM.AGGREGATOR };
};

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
