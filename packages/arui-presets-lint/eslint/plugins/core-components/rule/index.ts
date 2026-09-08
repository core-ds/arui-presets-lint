import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';

import { CORE_COMPONENTS_PACKAGE } from '../constants.js';
import { recordFinding } from '../report.js';
import { getSplitComponents } from '../scanner.js';
import { type CoreComponentsImportRuleOptions } from '../types.js';

type ParsedSource = {
    component: string;
    platform: string | null;
};

const STANDALONE_PREFIX = `${CORE_COMPONENTS_PACKAGE}-`;

/**
 * Извлекает имя компонента и платформенный суффикс из модуля агрегатора
 * или из отдельного подпакета @alfalab/core-components-<pkg>.
 * Например:
 *   '@alfalab/core-components/button/desktop' -> { component: 'button', platform: 'desktop' }
 *   '@alfalab/core-components-button/desktop' -> { component: 'button', platform: 'desktop' }
 *   '@alfalab/core-components-button'         -> { component: 'button', platform: null }
 */
const parseCoreComponentsSource = (source: string): ParsedSource | null => {
    if (source === CORE_COMPONENTS_PACKAGE) return { component: '', platform: null };

    // Ветка отдельного подпакета: '@alfalab/core-components-<pkg>[/platform]'
    if (source.startsWith(STANDALONE_PREFIX)) {
        const normalized = source
            .slice(STANDALONE_PREFIX.length)
            .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
            .replace(/\/index$/, '');
        const [component, platform] = normalized.split('/');

        return { component, platform: platform ?? null };
    }

    const prefix = `${CORE_COMPONENTS_PACKAGE}/`;

    // Ветка агрегатора: '@alfalab/core-components/<pkg>[/platform]'
    if (!source.startsWith(prefix)) return null;

    // Отбрасываем возможный index.js, index и/или расширение
    const normalized = source
        .slice(prefix.length)
        .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
        .replace(/\/index$/, '');
    const [component, platform] = normalized.split('/');

    return { component, platform: platform ?? null };
};

export const coreComponentsImportRule: TSESLint.RuleModule<
    'missingPlatform',
    [CoreComponentsImportRuleOptions]
> = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Требует использовать платформенные импорты (@alfalab/core-components/<pkg>/desktop или @alfalab/core-components/<pkg>/mobile) ' +
                'для компонентов core-components, у которых есть разделение на desktop/mobile',
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
                    reportFile: {
                        oneOf: [{ type: 'string' }, { type: 'boolean' }],
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            missingPlatform:
                'Компонент "{{component}}" имеет разделение на desktop/mobile. ' +
                'Используйте платформенный импорт "{{packageName}}/{{component}}/desktop" или "{{packageName}}/{{component}}/mobile" ' +
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

        // Список сплит-компонентов резолвится относительно файла, который линтится,
        // чтобы учитывать версию core-components именно этого потребительского проекта.
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

            context.report({
                node,
                messageId: 'missingPlatform',
                data: {
                    component: parsed.component,
                    packageName: CORE_COMPONENTS_PACKAGE,
                },
            });

            recordFinding(
                {
                    component: parsed.component,
                    file: context.filename,
                    line: node.loc.start.line,
                    importPath: sourceValue,
                },
                options.reportFile,
            );
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
