import { type AST, type Linter } from 'eslint';

// Для неизвестного формата нужен только корневой узел, чтобы запустить проверку пути.
// Исходный текст остаётся в ESLint: пользовательский parser или language в следующем
// конфиге может переопределить эту обработку, не потеряв содержимое файла.
export const filenameOnlyParser: Linter.ESTreeParser = {
    meta: { name: 'arui-presets-lint/filename-only' },
    parse(text): AST.Program {
        const lines = text.split(/\r\n|[\n\r\u2028\u2029]/u);

        return {
            type: 'Program',
            sourceType: 'module',
            body: [],
            tokens: [],
            comments: [],
            range: [0, text.length],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: lines.length, column: lines.at(-1)?.length ?? 0 },
            },
        };
    },
};
