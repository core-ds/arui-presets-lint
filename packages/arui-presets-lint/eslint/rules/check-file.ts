import { type Linter } from 'eslint';
import checkFilePlugin from 'eslint-plugin-check-file';

import {
    ANOTHER_FILES_SCOPE,
    GLOBAL_SCRIPTS_SCOPE,
    JSON_SCOPE,
    MARKDOWN_SCOPE,
} from '../constants.js';
import { filenameOnlyParser } from '../plugins/ascii/filename-only-parser.js';
import { asciiPlugin } from '../plugins/ascii/index.js';

// Glob с диапазоном ASCII: ищет любой символ вне него в одном сегменте пути.
const nonAsciiPathSegment = '*[^\u0000-\u007F]*';

export const checkFileConfig: Linter.Config[] = [
    {
        name: 'arui-presets-lint/check-file',
        plugins: {
            // Конфиг экспортируется отдельно через /eslint/rules и регистрирует свои плагины.
            ascii: asciiPlugin,
            'check-file': checkFilePlugin,
        },
        rules: {
            // Проверяет полный путь внутри проекта, включая промежуточные расширения файла.
            // https://github.com/core-ds/arui-presets-lint/issues/33
            'ascii/no-non-ascii-filenames': 'error',

            // Все названия папок должны быть в kebab-case
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/folder-naming-convention.md
            'check-file/folder-naming-convention': ['error', { '**/*.*': 'KEBAB_CASE' }],

            // Все названия файлов должны быть в kebab-case
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md
            'check-file/filename-naming-convention': [
                'error',
                {
                    [GLOBAL_SCRIPTS_SCOPE]: 'KEBAB_CASE',
                    [ANOTHER_FILES_SCOPE]: 'KEBAB_CASE',
                    [JSON_SCOPE]: 'KEBAB_CASE',
                },
                { ignoreMiddleExtensions: true },
            ],

            // Список запрещенных названий файлов
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-blocklist.md
            'check-file/filename-blocklist': [
                'error',
                { '**/tsconfig.eslint.json': '*tsconfig.json' },
                {
                    errorMessage:
                        'Вместо tsconfig.eslint.json используйте languageOptions.parserOptions.projectService.allowDefaultProject в конфиге eslint',
                },
            ],
        },
    },
    {
        // Проверяем также файлы с неизвестными ESLint расширениями, если имя или папка не ASCII.
        // Известные расширения обрабатываются своими парсерами и процессорами ниже.
        name: 'arui-presets-lint/non-ascii-files',
        // ?* включает неизвестные расширения: ESLint считает завершающий /* универсальным glob.
        files: [`**/${nonAsciiPathSegment}`, `**/${nonAsciiPathSegment}/**/?*`],
        ignores: [
            GLOBAL_SCRIPTS_SCOPE,
            JSON_SCOPE,
            MARKDOWN_SCOPE,
            ANOTHER_FILES_SCOPE,
            // CHANGELOG.md исключён из Markdown-парсера, поэтому проверяем только его путь.
            '!**/CHANGELOG.md',
        ],
        // Parser переопределяется конфигом потребителя; пустой processor стёр бы текст
        // ещё до запуска его парсера и скрыл бы ошибки в пользовательских форматах.
        languageOptions: { parser: filenameOnlyParser },
    },
    {
        // Включаем проверку других расширений файлов в eslint-plugin-check-file (которые процессор eslint не поддерживает).
        // Для JSON и Markdown полноценный парсинг подключён через @eslint/json и @eslint/markdown, поэтому здесь они не нужны.
        // Не должен пересекаться с остальными расширениями, см. constants.ts
        files: [ANOTHER_FILES_SCOPE],
        processor: 'check-file/eslint-processor-check-file',
    },
];
