import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { type ESLint } from 'eslint';
import path from 'node:path';

const nonAsciiPattern = /[^\p{ASCII}]/u;

const identifiersRule: TSESLint.RuleModule<'nonAsciiIdentifier', []> = {
    defaultOptions: [],
    meta: {
        type: 'problem',
        docs: {
            description: 'Запрещает символы вне ASCII в идентификаторах',
        },
        schema: [],
        messages: {
            nonAsciiIdentifier: 'Идентификатор "{{name}}" содержит символы вне ASCII.',
        },
    },
    create(context) {
        const reportedPositions = new Set<number>();

        const checkIdentifier = (
            node: TSESTree.Identifier | TSESTree.PrivateIdentifier | TSESTree.JSXIdentifier,
        ) => {
            if (!nonAsciiPattern.test(node.name) || reportedPositions.has(node.range[0])) {
                return;
            }

            // В { name } eslint видит имя дважды: как ключ и как значение.
            // Сообщаем об ошибке только один раз.
            reportedPositions.add(node.range[0]);
            context.report({ node, messageId: 'nonAsciiIdentifier', data: { name: node.name } });
        };

        return {
            Identifier: checkIdentifier,
            PrivateIdentifier: checkIdentifier,
            JSXIdentifier: checkIdentifier,
        };
    },
};

const filenameRule: TSESLint.RuleModule<'nonAsciiFilename', []> = {
    defaultOptions: [],
    meta: {
        type: 'problem',
        docs: {
            description: 'Запрещает символы вне ASCII в именах файлов и папок внутри проекта',
        },
        schema: [],
        messages: {
            nonAsciiFilename: 'Имя файла или папки "{{name}}" содержит символы вне ASCII.',
        },
    },
    create(context) {
        const checkFilename = () => {
            // Проверяем имя исходного файла, а не виртуального файла, который создал процессор
            const filename = context.physicalFilename;

            // eslint использует это имя при проверке текста без пути к файлу
            if (filename.startsWith('<') && filename.endsWith('>')) {
                return;
            }

            // Каталог самого проекта может содержать Unicode; проверяем только путь внутри него
            const relativeFilename = path.relative(context.cwd, filename);
            const name = relativeFilename
                .split(path.sep)
                .find((part) => nonAsciiPattern.test(part));

            if (name) {
                context.report({
                    loc: { line: 1, column: 0 },
                    messageId: 'nonAsciiFilename',
                    data: { name },
                });
            }
        };

        // Проверяем путь к файлу для JS/TS, Markdown, JSON и других форматов
        return {
            Program: checkFilename,
            Document: checkFilename,
            root: checkFilename,
            StyleSheet: checkFilename,
        };
    },
};

// Типы контекста правила в eslint и typescript-eslint различаются,
// поэтому при экспорте явно приводим тип плагина к ESLint.Plugin
export const asciiPlugin = {
    rules: {
        'no-non-ascii-identifiers': identifiersRule,
        'no-non-ascii-filenames': filenameRule,
    },
} as unknown as ESLint.Plugin;
