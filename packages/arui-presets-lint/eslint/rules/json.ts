import jsonPlugin from '@eslint/json';
import { type Linter } from 'eslint';

const jsonRules: Linter.RulesRecord = {
    // Запрещает дублирование ключей в JSON-объектах
    // https://github.com/eslint/json/blob/main/docs/rules/no-duplicate-keys.md
    'json/no-duplicate-keys': 'error',

    // Запрещает пустые ключи в JSON-объектах
    // https://github.com/eslint/json/blob/main/docs/rules/no-empty-keys.md
    'json/no-empty-keys': 'error',

    // Запрещает ключи, не приведённые к нормальной юникод-форме (NFC)
    // https://github.com/eslint/json/blob/main/docs/rules/no-unnormalized-keys.md
    'json/no-unnormalized-keys': 'error',

    // Запрещает числа выходящие за пределы безопасного диапазона Number
    // https://github.com/eslint/json/blob/main/docs/rules/no-unsafe-values.md
    'json/no-unsafe-values': 'error',
};

const plugins = { json: jsonPlugin } as unknown as Linter.Config['plugins'];

export const jsonConfig: Linter.Config[] = [
    {
        name: 'arui-presets-lint/json',
        files: ['**/*.json'],
        // Файлы с трейлинг-комментариями или огромным размером, которые JSON-парсер не сможет обработать
        ignores: ['**/package-lock.json', '**/tsconfig*.json'],
        plugins,
        language: 'json/json',
        rules: jsonRules,
    },
    {
        name: 'arui-presets-lint/jsonc',
        // tsconfig*.json по соглашению поддерживает комментарии и трейлинг-запятые
        files: ['**/*.jsonc', '**/tsconfig*.json'],
        plugins,
        language: 'json/jsonc',
        languageOptions: {
            allowTrailingCommas: true,
        },
        rules: jsonRules,
    },
    {
        name: 'arui-presets-lint/json5',
        files: ['**/*.json5'],
        plugins,
        language: 'json/json5',
        rules: jsonRules,
    },
];
