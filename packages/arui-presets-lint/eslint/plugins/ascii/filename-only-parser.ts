import { type AST, type Linter } from 'eslint';

// Для проверки пути достаточно пустого корневого узла.
// Текст файла сохраняем для парсера или языкового плагина из конфига проекта.
export const filenameOnlyParser: Linter.ESTreeParser = {
    meta: { name: 'arui-presets-lint/filename-only' },
    parse(text): AST.Program {
        // разбиваем текст на строки, учитывая разные виды переносов.
        const lines = text.split(/\r\n|[\n\r\u2028\u2029]/u);

        return {
            type: 'Program',
            sourceType: 'module',
            body: [],
            tokens: [],
            comments: [],
            range: [0, text.length],
            loc: {
                start: {
                    line: 1,
                    column: 0,
                },
                end: {
                    line: lines.length,
                    column: lines.at(-1)?.length ?? 0,
                },
            },
        };
    },
};
