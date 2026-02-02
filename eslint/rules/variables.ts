import { type TSESLint } from '@typescript-eslint/utils';

export const variablesConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/variables',
    rules: {
        // Требует/запрещает инициализацию переменных при объявлении
        // https://eslint.org/docs/rules/init-declarations
        'init-declarations': 'off',

        // Запрещает метки, совпадающие с именами переменных
        // https://eslint.org/docs/rules/no-label-var
        'no-label-var': 'error',

        // Запрещает определённые глобальные переменные
        // https://eslint.org/docs/rules/no-restricted-globals
        'no-restricted-globals': [
            'error',
            {
                name: 'isFinite',
                message:
                    'Use Number.isFinite instead https://github.com/airbnb/javascript#standard-library--isfinite',
            },
            {
                name: 'isNaN',
                message:
                    'Use Number.isNaN instead https://github.com/airbnb/javascript#standard-library--isnan',
            },
        ],

        // Запрещает объявление переменных, уже объявленных во внешней области
        // https://eslint.org/docs/latest/rules/no-shadow
        'no-shadow': 'warn',

        // Запрещает использовать undefined при инициализации переменных
        // https://eslint.org/docs/rules/no-undef-init
        'no-undef-init': 'error',

        // Запрещает объявление неиспользуемых переменных
        // https://eslint.org/docs/rules/no-unused-vars
        'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],

        // Запрещает использование переменных до их объявления
        // https://eslint.org/docs/rules/no-use-before-define
        'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],

        // Запрещает унарные операторы ++ и --
        // https://eslint.org/docs/latest/rules/no-plusplus
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],

        // Требует объявлять все переменные в начале области видимости
        // https://eslint.org/docs/rules/vars-on-top
        'vars-on-top': 'error',

        // Рекомендует const для переменных, не изменяемых после объявления
        // https://eslint.org/docs/latest/rules/prefer-const
        'prefer-const': [
            'error',
            {
                destructuring: 'any',
                ignoreReadBeforeAssign: true,
            },
        ],

        // Запрещает объявления функций/переменных во вложенных блоках
        // https://eslint.org/docs/rules/no-inner-declarations
        'no-inner-declarations': 'error',

        // Запрещает использование оператора void
        // https://eslint.org/docs/rules/no-void
        'no-void': ['error', { allowAsStatement: true }],
    },
};
