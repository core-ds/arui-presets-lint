import { type TSESLint } from '@typescript-eslint/utils';
import nodePlugin from 'eslint-plugin-n';
import globals from 'globals';

export const nodeRulesConfig: TSESLint.FlatConfig.Config = {
    ...nodePlugin.configs['flat/recommended'],
    name: 'arui-presets-lint/node',
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },
    plugins: {
        n: nodePlugin,
    },

    rules: {
        // https://github.com/eslint-community/eslint-plugin-n?tab=readme-ov-file#-rules
        ...nodePlugin.configs['flat/recommended'].rules,
        // Требует return после колбэка
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/callback-return.md
        'n/callback-return': 'off',

        // Требует, чтобы все require были на верхнем уровне
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/global-require.md
        'n/global-require': 'error',

        // Требует обработку ошибок в колбэках
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/handle-callback-err.md
        'n/handle-callback-err': 'off',

        // Запрещает смешивать обычные объявления переменных и require
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-mixed-requires.md
        'n/no-mixed-requires': ['off', false],

        // Запрещает использовать new с функцией require
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-new-require.md
        'n/no-new-require': 'error',

        // Запрещает конкатенацию строк с __dirname и __filename
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-path-concat.md
        'n/no-path-concat': 'error',

        // Запрещает использование process.env
        // https://github.com/eslint-community/eslint-plugin-n/blob/master/docs/rules/no-process-env.md
        'n/no-process-env': 'off',

        // Запрет импорта непубличных модулей
        // https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md
        'n/no-unpublished-import': 'off',

        // Запрет использования process.exit()
        // https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-exit.md
        'n/no-process-exit': 'off',

        // Проверка путей в импортах
        // https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md
        'n/no-missing-import': 'off',
    },
};
