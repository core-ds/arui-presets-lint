import { type TSESLint } from '@typescript-eslint/utils';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { bestPracticesConfig } from './best-practices';
import { importsConfig } from './imports';
import { variablesConfig } from './variables';

const bestPracticesRules = bestPracticesConfig.rules as Record<
    string,
    TSESLint.FlatConfig.RuleEntry
>;

const importsRules = importsConfig.rules as Record<string, TSESLint.FlatConfig.RuleEntry>;
const variablesRules = variablesConfig.rules as Record<string, TSESLint.FlatConfig.RuleEntry>;

export const typescriptConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/typescript',
    files: ['**/*.{ts,tsx,mts,cts,mtsx,ctsx}'],
    languageOptions: {
        parser: tseslint.parser,
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            projectService: true,
            ecmaFeatures: { jsx: true },
        },
        globals: {
            ...globals.es2022,
            ...globals.browser,
            ...globals.node,
        },
    },
    plugins: {
        '@typescript-eslint': tseslint.plugin,
    },
    rules: {
        // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended-type-checked.ts
        ...(tseslint.configs.recommendedTypeChecked.reduce((acc, obj) => {
            return {
                ...acc,
                ...obj?.rules,
            };
        }, {}) as TSESLint.FlatConfig.Rules),

        // Требовать явного указания типов возвращаемых данных и аргументов для методов публичных классов экспортируемых функций и классов
        // https://typescript-eslint.io/rules/explicit-module-boundary-types
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // Требовать явно определенного возвращаемового типа для функций и методов класса
        // https://typescript-eslint.io/rules/explicit-function-return-type
        '@typescript-eslint/explicit-function-return-type': 'off',

        // Требует использования либо T[], либо Array<T> для массивов
        // https://typescript-eslint.io/rules/array-type
        '@typescript-eslint/array-type': [
            'error',
            { default: 'array-simple', readonly: 'array-simple' },
        ],
        // Обеспечивает консистентное написание определения типов
        // https://typescript-eslint.io/rules/consistent-type-assertions
        '@typescript-eslint/consistent-type-assertions': 'error',

        // Обеспечивает консистентное использование импорта типов
        // https://typescript-eslint.io/rules/consistent-type-imports
        '@typescript-eslint/consistent-type-imports': [
            'error',
            { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
        ],

        // Обеспечивает консистентное использование экспорта типов
        // https://typescript-eslint.io/rules/consistent-type-exports
        '@typescript-eslint/consistent-type-exports': [
            'error',
            { fixMixedExportsWithInlineTypeSpecifier: true },
        ],

        // Определяет правила именования
        // https://typescript-eslint.io/rules/naming-convention
        '@typescript-eslint/naming-convention': [
            'error',
            { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
            { selector: 'function', format: ['camelCase', 'PascalCase'] },
            { selector: 'typeLike', format: ['PascalCase'] },
        ],

        // Запрещает вызов require()
        // https://typescript-eslint.io/rules/no-require-imports
        '@typescript-eslint/no-require-imports': 'off',

        // Гарантировать соответствие именованных импортов именованным экспортам
        // Отключено, так как компилятор TypeScript это умеет делать
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/named.md
        'import-x/named': 'off',

        // Запрет передачи в функцию переменной с типом any
        // https://typescript-eslint.io/rules/no-unsafe-argument
        '@typescript-eslint/no-unsafe-argument': 'off',

        /*
            Переопределяем extension rules
            https://typescript-eslint.io/rules/#extension-rules
        */

        // Требует использование "this" в методах классов
        // https://eslint.org/docs/rules/class-methods-use-this
        'class-methods-use-this': 'off',
        // https://typescript-eslint.io/rules/class-methods-use-this
        '@typescript-eslint/class-methods-use-this': bestPracticesRules['class-methods-use-this'],

        // Запрещает неиспользуемые выражения
        // https://eslint.org/docs/rules/no-unused-expressions
        'no-unused-expressions': 'off',
        // https://typescript-eslint.io/rules/no-unused-expressions
        '@typescript-eslint/no-unused-expressions': bestPracticesRules['no-unused-expressions'],

        // Требует `await` в `async function` (не рекомендуется к использованию)
        // https://typescript-eslint.io/rules/require-await
        '@typescript-eslint/require-await': 'off',

        // Запрещает ненужный конструктор
        // https://eslint.org/docs/rules/no-useless-constructor
        'no-useless-constructor': 'off',
        // https://typescript-eslint.io/rules/no-useless-constructor
        '@typescript-eslint/no-useless-constructor': bestPracticesRules['no-useless-constructor'],

        // Запрещает eval()-подобные методы
        // https://eslint.org/docs/rules/no-implied-eval
        'no-implied-eval': 'error',
        // https://typescript-eslint.io/rules/no-implied-eval/
        '@typescript-eslint/no-implied-eval': bestPracticesRules['no-implied-eval'],

        // Запрещает создание функций внутри циклов
        // https://eslint.org/docs/rules/no-loop-func
        'no-loop-func': 'off',
        // https://typescript-eslint.io/rules/no-loop-func
        '@typescript-eslint/no-loop-func': bestPracticesRules['no-loop-func'],

        // Запрещает «магические» числа
        // https://eslint.org/docs/rules/no-magic-numbers
        'no-magic-numbers': 'off',
        // https://typescript-eslint.io/rules/no-magic-numbers
        '@typescript-eslint/no-magic-numbers': bestPracticesRules['no-magic-numbers'],

        // Поощряет использование точечной нотации, когда возможно
        // https://eslint.org/docs/rules/dot-notation
        'dot-notation': 'off',
        // https://typescript-eslint.io/rules/dot-notation
        '@typescript-eslint/dot-notation': bestPracticesRules['dot-notation'],

        // Запрещает дублирование членов класса
        // https://eslint.org/docs/rules/no-dupe-class-members
        // Отключено, так как уже проверяется компилятором TypeScript
        // https://typescript-eslint.io/rules/no-dupe-class-members
        'no-dupe-class-members': 'off',

        // Запрещает повторное объявление одной и той же переменной
        // https://eslint.org/docs/latest/rules/no-redeclare#rule-details
        // Отключено, так как уже проверяется компилятором TypeScript
        // https://typescript-eslint.io/rules/no-redeclare
        'no-redeclare': 'off',

        // Запрещает пустые функции, кроме автономных/стрелочных
        // https://eslint.org/docs/rules/no-empty-function
        'no-empty-function': 'off',
        // https://typescript-eslint.io/rules/no-empty-function
        '@typescript-eslint/no-empty-function': bestPracticesRules['no-empty-function'],

        // Требует, чтобы оператор return всегда/никогда возвращал значение
        // https://eslint.org/docs/rules/consistent-return
        // Отключено для ts, используйте вместо этого опцию noImplicitReturns в tsconfig.json
        // https://typescript-eslint.io/rules/consistent-return
        'consistent-return': 'off',

        // Требует чтобы дефолтные параметры функций были в конце
        // https://eslint.org/docs/rules/default-param-last
        'default-param-last': 'off',
        '@typescript-eslint/default-param-last': bestPracticesRules['default-param-last'],

        // Требует/запрещает инициализацию переменных при объявлении
        // https://eslint.org/docs/rules/init-declarations
        'init-declarations': 'off',
        // https://typescript-eslint.io/rules/init-declarations
        '@typescript-eslint/init-declarations': variablesRules['init-declarations'],

        // Лимит на количество параметров в объявлении функции
        // https://eslint.org/docs/rules/max-params
        'max-params': 'off',
        // https://typescript-eslint.io/rules/max-params
        '@typescript-eslint/max-params': bestPracticesRules['max-params'],

        // Запрещает конструктор Array
        // https://eslint.org/docs/rules/no-array-constructor
        'no-array-constructor': 'off',
        // https://typescript-eslint.io/rules/no-array-constructor
        '@typescript-eslint/no-array-constructor': bestPracticesRules['no-array-constructor'],

        // Запрещает this вне классов или похожих объектов
        // https://eslint.org/docs/rules/no-invalid-this
        // Отключено, так как уже проверяется компилятором TypeScript в stict-режиме
        // https://typescript-eslint.io/rules/no-redeclare
        'no-invalid-this': 'off',

        // Запрещает указанные имена при экспорте
        // https://eslint.org/docs/rules/no-restricted-exports
        'no-restricted-imports': 'off',
        // https://typescript-eslint.io/rules/no-restricted-imports
        '@typescript-eslint/no-restricted-imports': importsRules['no-restricted-imports'],

        // Запрещает объявление переменных, уже объявленных во внешней области
        // https://eslint.org/docs/latest/rules/no-shadow
        'no-shadow': 'off',
        // https://typescript-eslint.io/rules/no-shadow
        '@typescript-eslint/no-shadow': variablesRules['no-shadow'],

        // Запрещает объявление неиспользуемых переменных
        // https://eslint.org/docs/rules/no-unused-vars
        'no-unused-vars': 'off',
        // https://typescript-eslint.io/rules/no-unused-vars
        '@typescript-eslint/no-unused-vars': variablesRules['no-unused-vars'],

        // Запрещает использование переменных до их объявления
        // https://eslint.org/docs/rules/no-use-before-define
        'no-use-before-define': 'off',
        // https://typescript-eslint.io/rules/no-use-before-define
        '@typescript-eslint/no-use-before-define': variablesRules['no-use-before-define'],

        // Запрещает вызов объектов, не относящихся к Error через throw
        // https://eslint.org/docs/latest/rules/no-throw-literal
        'no-throw-literal': 'off',
        // https://typescript-eslint.io/rules/only-throw-error
        '@typescript-eslint/only-throw-error': 'error',

        // Предпочитать деструктуризацию массивов и объектов
        // https://eslint.org/docs/rules/prefer-destructuring
        'prefer-destructuring': 'off',
        // https://typescript-eslint.io/rules/prefer-destructuring/
        '@typescript-eslint/prefer-destructuring': bestPracticesRules['prefer-destructuring'],

        // Требует использовать объекты Error как причины отклонения Promise
        // https://eslint.org/docs/rules/prefer-promise-reject-errors
        'prefer-promise-reject-errors': 'off',
        // https://typescript-eslint.io/rules/prefer-promise-reject-errors
        '@typescript-eslint/prefer-promise-reject-errors':
            bestPracticesRules['prefer-promise-reject-errors'],
        /*
        Конец extension rules
        */

        // Запрет возврата any из функций
        // https://typescript-eslint.io/rules/no-unsafe-return/
        '@typescript-eslint/no-unsafe-return': 'off',

        // Запрет обращения к значениям с типом any
        // https://typescript-eslint.io/rules/no-unsafe-member-access/
        '@typescript-eslint/no-unsafe-member-access': 'off',
    },
};
