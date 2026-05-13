import { type Linter } from 'eslint';
import checkFilePlugin from 'eslint-plugin-check-file';

import { ANOTHER_FILES_SCOPE, GLOBAL_SCRIPTS_SCOPE } from '../constants.js';

export const checkFileConfig: Linter.Config[] = [
    {
        name: 'arui-presets-lint/check-file',
        plugins: {
            'check-file': checkFilePlugin,
        },
        rules: {
            // Все названия папок должны быть в kebab-case
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md
            'check-file/folder-naming-convention': [
                'error',
                { '**/*.*': 'KEBAB_CASE' },
                { ignoreMiddleExtensions: true },
            ],

            // Все названия файлов должны быть в kebab-case
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/folder-naming-convention.md
            'check-file/filename-naming-convention': [
                'error',
                { [GLOBAL_SCRIPTS_SCOPE]: 'KEBAB_CASE', [ANOTHER_FILES_SCOPE]: 'KEBAB_CASE' },
                { ignoreMiddleExtensions: true },
            ],

            // Список запрещенных названий файлов
            // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-blocklist.md
            'check-file/filename-blocklist': [
                'error',
                { '**/tsconfig.eslint.json': '*tsconfig.json' },
                {
                    errorMessage:
                        'Вместо tsconfig.eslint.json используйте languageOptions.parserOptions.projectService.allowDefaultProject в конфиге eslint',
                },
            ],
        },
    },
    {
        // Включаем проверку других расширений файлов в eslint-plugin-check-file (которые процессор eslint не поддерживает).
        // Для JSON и Markdown полноценный парсинг подключён через @eslint/json и @eslint/markdown,
        // поэтому здесь они не нужны.
        // ⚠️ НЕ ДОЛЖНО ПЕРЕСЕКАТЬСЯ С ПАТТЕРНОМ FILES, КОТОРЫЙ УКАЗАН ВЫШЕ
        files: [ANOTHER_FILES_SCOPE],
        processor: 'check-file/eslint-processor-check-file',
    },
];
