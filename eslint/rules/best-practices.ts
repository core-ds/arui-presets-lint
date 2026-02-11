import { type TSESLint } from '@typescript-eslint/utils';
import unicornPlugin from 'eslint-plugin-unicorn';

export const bestPracticesConfig: TSESLint.FlatConfig.Config = {
    ...unicornPlugin.configs.unopinionated,
    name: 'arui-presets-lint/best-practices',
    plugins: {
        unicorn: unicornPlugin,
    },
    rules: {
        // https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main?tab=readme-ov-file#rules
        ...unicornPlugin.configs.unopinionated.rules,

        // Требует наличие оператора return в геттерах свойств
        // https://eslint.org/docs/rules/getter-return
        'getter-return': 'off',

        // Запрещает await внутри циклов
        // https://eslint.org/docs/rules/no-await-in-loop
        'no-await-in-loop': 'error',

        // Запрещает использование console
        // https://eslint.org/docs/latest/rules/no-console
        'no-console': 'warn',

        // Запрещает константные выражения в условиях
        // https://eslint.org/docs/latest/rules/no-constant-condition
        'no-constant-condition': 'warn',

        // Запрещает возвращать значения из функций-исполнителей Promise
        // https://eslint.org/docs/rules/no-promise-executor-return
        'no-promise-executor-return': 'error',

        // Запрещает синтаксис плейсхолдеров шаблонных строк в обычных строках
        // https://eslint.org/docs/rules/no-template-curly-in-string
        'no-template-curly-in-string': 'error',

        // Запрещает циклы, тело которых допускает только одну итерацию
        // https://eslint.org/docs/rules/no-unreachable-loop
        'no-unreachable-loop': [
            'error',
            {
                ignore: [], // WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement
            },
        ],

        // Запрещает optional chaining в контекстах, где undefined недопустим
        // https://eslint.org/docs/rules/no-unsafe-optional-chaining
        'no-unsafe-optional-chaining': ['error', { disallowArithmeticOperators: true }],

        // Запрещает присваивания, ведущие к гонкам из-за await или yield
        // https://eslint.org/docs/rules/require-atomic-updates
        // Примечание: отключено из-за нестабильности
        'require-atomic-updates': 'off',

        // Требует сравнивать результат typeof со строковым литералом
        // https://eslint.org/docs/rules/valid-typeof
        'valid-typeof': ['error', { requireStringLiterals: true }],

        // Требует имя у функциональных выражений
        // https://eslint.org/docs/rules/func-names
        'func-names': 'warn',

        // Максимальное число строк в файле
        // https://eslint.org/docs/rules/max-lines
        'max-lines': ['warn', 300],

        // Максимальная глубина вложенности колбэков
        // https://eslint.org/docs/rules/max-nested-callbacks
        'max-nested-callbacks': 'warn',

        // Лимит на количество параметров в объявлении функции
        // https://eslint.org/docs/rules/max-params
        'max-params': ['warn', { max: 5, countVoidThis: false }],

        // Требует заглавную букву у конструкторов
        // https://eslint.org/docs/latest/rules/new-cap
        'new-cap': [
            'error',
            {
                newIsCap: true,
                newIsCapExceptions: [],
                capIsNew: false,
                capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
            },
        ],

        // Запрещает конструктор Array
        // https://eslint.org/docs/rules/no-array-constructor
        'no-array-constructor': 'error',

        // Запрещает побитовые операторы
        // https://eslint.org/docs/rules/no-bitwise
        'no-bitwise': 'error',

        // Запрещает if как единственный оператор в блоке else
        // https://eslint.org/docs/rules/no-lonely-if
        'no-lonely-if': 'error',

        // Запрещает цепочки присваиваний
        // https://eslint.org/docs/rules/no-multi-assign
        'no-multi-assign': ['error'],

        // Запрещает отрицательные условия
        // https://eslint.org/docs/rules/no-negated-condition
        'no-negated-condition': 'warn',

        // Запрещает вложенные тернарные выражения
        // https://eslint.org/docs/latest/rules/no-nested-ternary
        'no-nested-ternary': 'error',

        // Запрещает конструктор Object
        // https://eslint.org/docs/latest/rules/no-object-constructor
        'no-object-constructor': 'error',

        // Запрещает унарные операторы ++ и --
        // https://eslint.org/docs/rules/no-plusplus
        'no-plusplus': 'error',

        // Запрещает некоторые синтаксические конструкции
        // https://eslint.org/docs/rules/no-restricted-syntax
        'no-restricted-syntax': [
            'error',
            {
                selector: 'ForInStatement',
                message:
                    'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
            },
            {
                selector: 'LabeledStatement',
                message:
                    'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
            },
            {
                selector: 'WithStatement',
                message:
                    '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
            },
            {
                selector: 'TSTypeReference[typeName.name="PropsWithChildren"]',
                message:
                    'Do not use "PropsWithChildren". Use explicit children typing instead, for example: "children?: ReactNode";',
            },
            {
                selector: 'Literal[value=/(?:[a-z][а-яё]|[а-яё][a-z])/i]',
                message:
                    'Detected mixed language layout within a single word. For example, "case" (first character in ru-encoding)',
            },
        ],

        // Запрещает подчёркивания в конце/начале идентификаторов
        // https://eslint.org/docs/rules/no-underscore-dangle
        'no-underscore-dangle': [
            'error',
            {
                allow: ['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'],
                allowAfterThis: false,
                allowAfterSuper: false,
                enforceInMethodNames: true,
            },
        ],

        // Запрещает использовать булевы литералы в условиях
        // Также предпочитать `a || b` вместо `a ? a : b`
        // https://eslint.org/docs/rules/no-unneeded-ternary
        'no-unneeded-ternary': ['error', { defaultAssignment: false }],

        // Разрешает только одно объявление var на функцию
        // https://eslint.org/docs/latest/rules/one-var
        'one-var': ['error', 'never'],

        // Требует сокращённую форму присваивания, где возможно
        // https://eslint.org/docs/rules/operator-assignment
        'operator-assignment': ['error', 'always'],

        // Запрещает Math.pow в пользу оператора **
        // https://eslint.org/docs/rules/prefer-exponentiation-operator
        'prefer-exponentiation-operator': 'error',

        // Предпочитать spread объектов вместо Object.assign
        // https://eslint.org/docs/rules/prefer-object-spread
        'prefer-object-spread': 'error',

        // Обеспечивает наличие пар геттер/сеттер в объектах
        // https://eslint.org/docs/rules/accessor-pairs
        'accessor-pairs': 'off',

        // Требует оператор return в колбэках методов массива
        // https://eslint.org/docs/rules/array-callback-return
        'array-callback-return': ['error', { allowImplicit: true }],

        // Рассматривает объявления var как блочные
        // https://eslint.org/docs/rules/block-scoped-var
        'block-scoped-var': 'error',

        // Максимально допустимая цикломатическая сложность программы
        // https://eslint.org/docs/rules/complexity
        complexity: ['warn', 20],

        // Требует использование "this" в методах классов
        // https://eslint.org/docs/rules/class-methods-use-this
        'class-methods-use-this': [
            'error',
            {
                exceptMethods: [],
            },
        ],

        // Требует, чтобы оператор return всегда/никогда возвращал значение
        // https://eslint.org/docs/rules/consistent-return
        'consistent-return': 'error',

        // Требует ветку default в switch
        // https://eslint.org/docs/rules/default-case
        'default-case': 'off',

        // Требует, чтобы default был последним в switch
        // https://eslint.org/docs/rules/default-case-last
        'default-case-last': 'error',

        // Требует чтобы дефолтные параметры функций были в конце
        // https://eslint.org/docs/rules/default-param-last
        'default-param-last': 'warn',

        // Поощряет использование точечной нотации, когда возможно
        // https://eslint.org/docs/rules/dot-notation
        'dot-notation': ['error', { allowKeywords: true }],

        // Требует использовать === и !==
        // https://eslint.org/docs/rules/eqeqeq
        eqeqeq: ['error', 'always', { null: 'ignore' }],

        // Требует группировать пары аксессоров в литералах объектов и классах
        // https://eslint.org/docs/rules/grouped-accessor-pairs
        'grouped-accessor-pairs': 'error',

        // Требует проверку внутри циклов for-in
        // https://eslint.org/docs/rules/guard-for-in
        'guard-for-in': 'error',

        // Максимальное количество классов в файле
        // https://eslint.org/docs/rules/max-classes-per-file
        'max-classes-per-file': ['error', 1],

        // Запрещает alert, confirm и prompt
        // https://eslint.org/docs/rules/no-alert
        'no-alert': 'warn',

        // Запрещает arguments.caller и arguments.callee
        // https://eslint.org/docs/rules/no-caller
        'no-caller': 'error',

        // Запрещает возврат значения из конструктора
        // https://eslint.org/docs/rules/no-constructor-return
        'no-constructor-return': 'error',

        // Запрещает символ деления в начале регулярного выражения
        // https://eslint.org/docs/rules/no-div-regex
        'no-div-regex': 'off',

        // Запрещает else после return в if
        // https://eslint.org/docs/rules/no-else-return
        'no-else-return': ['error', { allowElseIf: false }],

        // Запрещает пустые функции, кроме автономных/стрелочных
        // https://eslint.org/docs/rules/no-empty-function
        'no-empty-function': [
            'error',
            {
                allow: ['arrowFunctions', 'functions', 'methods'],
            },
        ],

        // Запрещает сравнение с null без проверок типа
        // https://eslint.org/docs/rules/no-eq-null
        'no-eq-null': 'off',

        // Запрещает использование eval()
        // https://eslint.org/docs/rules/no-eval
        'no-eval': 'error',

        // Запрещает расширение нативных типов
        // https://eslint.org/docs/rules/no-extend-native
        'no-extend-native': 'error',

        // Запрещает ненужный bind функций
        // https://eslint.org/docs/rules/no-extra-bind
        'no-extra-bind': 'error',

        // Запрещает ненужные метки
        // https://eslint.org/docs/rules/no-extra-label
        'no-extra-label': 'error',

        // Запрещает var и именованные функции в глобальной области
        // https://eslint.org/docs/rules/no-implicit-globals
        'no-implicit-globals': 'off',

        // Запрещает eval()-подобные методы
        // https://eslint.org/docs/rules/no-implied-eval
        'no-implied-eval': 'error',

        // Запрещает this вне классов или похожих объектов
        // https://eslint.org/docs/rules/no-invalid-this
        'no-invalid-this': 'off',

        // Запрещает использование свойства __iterator__
        // https://eslint.org/docs/rules/no-iterator
        'no-iterator': 'error',

        // Запрещает метки, кроме как для циклов и switch
        // https://eslint.org/docs/rules/no-labels
        'no-labels': ['error', { allowLoop: false, allowSwitch: false }],

        // Запрещает ненужные вложенные блоки
        // https://eslint.org/docs/rules/no-lone-blocks
        'no-lone-blocks': 'error',

        // Запрещает создание функций внутри циклов
        // https://eslint.org/docs/rules/no-loop-func
        'no-loop-func': 'error',

        // Запрещает «магические» числа
        // https://eslint.org/docs/rules/no-magic-numbers
        'no-magic-numbers': [
            'off',
            {
                ignore: [],
                ignoreArrayIndexes: true,
                enforceConst: true,
                detectObjects: false,
            },
        ],

        // Запрещает многострочные строковые литералы
        // https://eslint.org/docs/rules/no-multi-str
        'no-multi-str': 'error',

        // Запрещает new вне присваивания или сравнения
        // https://eslint.org/docs/rules/no-new
        'no-new': 'error',

        // Запрещает new Function
        // https://eslint.org/docs/rules/no-new-func
        'no-new-func': 'error',

        // Запрещает создавать экземпляры String, Number, Boolean
        // https://eslint.org/docs/rules/no-new-wrappers
        'no-new-wrappers': 'error',

        // Запрещает восьмеричные escape-последовательности в строках, например
        // var foo = 'Copyright \251';
        // https://eslint.org/docs/rules/no-octal-escape
        'no-octal-escape': 'error',

        // Запрещает переназначение параметров функции
        // https://eslint.org/docs/rules/no-param-reassign.html
        'no-param-reassign': ['error', { props: false }],

        // Запрещает использование свойства __proto__
        // https://eslint.org/docs/rules/no-proto
        'no-proto': 'error',

        // Запрещает определенные свойства объектов
        // https://eslint.org/docs/rules/no-restricted-properties
        'no-restricted-properties': [
            'error',
            {
                object: 'arguments',
                property: 'callee',
                message: 'arguments.callee is deprecated',
            },
            {
                object: 'global',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'self',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'window',
                property: 'isFinite',
                message: 'Please use Number.isFinite instead',
            },
            {
                object: 'global',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                object: 'self',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                object: 'window',
                property: 'isNaN',
                message: 'Please use Number.isNaN instead',
            },
            {
                property: '__defineGetter__',
                message: 'Please use Object.defineProperty instead.',
            },
            {
                property: '__defineSetter__',
                message: 'Please use Object.defineProperty instead.',
            },
            {
                object: 'Math',
                property: 'pow',
                message: 'Use the exponentiation operator (**) instead.',
            },
        ],

        // Запрещает присваивание в операторе return
        // https://eslint.org/docs/rules/no-return-assign
        'no-return-assign': ['error', 'always'],

        // Запрещает URL вида `javascript:`
        // https://eslint.org/docs/rules/no-script-url
        'no-script-url': 'error',

        // Запрещает самоприсваивание
        // https://eslint.org/docs/rules/no-self-assign
        'no-self-assign': [
            'error',
            {
                props: true,
            },
        ],

        // Запрещает сравнение, где обе стороны идентичны
        // https://eslint.org/docs/rules/no-self-compare
        'no-self-compare': 'error',

        // Запрещает оператор запятая
        // https://eslint.org/docs/rules/no-sequences
        'no-sequences': 'error',

        // Ограничивает типы значений, которые можно «бросать»
        // https://eslint.org/docs/rules/no-throw-literal
        'no-throw-literal': 'error',

        // Запрещает немодифицируемые условия циклов
        // https://eslint.org/docs/rules/no-unmodified-loop-condition
        'no-unmodified-loop-condition': 'off',

        // Запрещает неиспользуемые выражения
        // https://eslint.org/docs/rules/no-unused-expressions
        'no-unused-expressions': [
            'error',
            {
                allowShortCircuit: false,
                allowTernary: false,
                allowTaggedTemplates: false,
            },
        ],

        // Запрещает бесполезную конкатенацию строк
        // https://eslint.org/docs/rules/no-useless-concat
        'no-useless-concat': 'error',

        // Запрещает избыточный return
        // https://eslint.org/docs/rules/no-useless-return
        'no-useless-return': 'error',

        // Запрещает оператор void
        // https://eslint.org/docs/rules/no-void
        'no-void': 'error',

        // Требует использовать объекты Error как причины отклонения Promise
        // https://eslint.org/docs/rules/prefer-promise-reject-errors
        'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],

        // Требует второй аргумент для parseInt()
        // https://eslint.org/docs/rules/radix
        radix: 'error',

        // Требует/запрещает «йода-условия»
        // https://eslint.org/docs/rules/yoda
        yoda: 'error',

        // Требует не использовать фигурные скобки там, где их можно опустить
        // https://eslint.org/docs/rules/arrow-body-style
        'arrow-body-style': [
            'error',
            'as-needed',
            {
                requireReturnForObjectLiteral: true,
            },
        ],

        // Проверяет вызов super() в конструкторах
        // https://eslint.org/docs/rules/constructor-super
        'constructor-super': 'off',

        // Запрещает модификацию переменных объявлений классов
        // https://eslint.org/docs/rules/no-class-assign
        'no-class-assign': 'error',

        // Запрещает использовать this/super до вызова super() в конструкторах
        // https://eslint.org/docs/rules/no-this-before-super
        'no-this-before-super': 'error',

        // Запрещает бесполезные вычисляемые ключи свойств
        // https://eslint.org/docs/rules/no-useless-computed-key
        'no-useless-computed-key': 'error',

        // Запрещает ненужный конструктор
        // https://eslint.org/docs/rules/no-useless-constructor
        'no-useless-constructor': 'error',

        // Запрещает переименование import/export и деструктуризации в то же имя
        // https://eslint.org/docs/rules/no-useless-rename
        'no-useless-rename': [
            'error',
            {
                ignoreDestructuring: false,
                ignoreImport: false,
                ignoreExport: false,
            },
        ],

        // Требует let или const вместо var
        // https://eslint.org/docs/latest/rules/no-var
        'no-var': 'error',

        // Требует краткий синтаксис методов и свойств в литералах объектов
        // https://eslint.org/docs/rules/object-shorthand
        'object-shorthand': [
            'error',
            'always',
            {
                ignoreConstructors: false,
                avoidQuotes: true,
            },
        ],

        // Рекомендует использовать стрелочные функции как колбэки
        // https://eslint.org/docs/latest/rules/prefer-arrow-callback
        'prefer-arrow-callback': [
            'error',
            {
                allowNamedFunctions: false,
                allowUnboundThis: true,
            },
        ],

        // Предпочитать деструктуризацию массивов и объектов
        // https://eslint.org/docs/rules/prefer-destructuring
        'prefer-destructuring': [
            'error',
            {
                VariableDeclarator: {
                    array: false,
                    object: true,
                },
                AssignmentExpression: {
                    array: true,
                    object: false,
                },
            },
            {
                enforceForRenamedProperties: false,
            },
        ],

        // Запрещает parseInt() в пользу бинарных/восьмеричных/шестнадцатеричных литералов
        // https://eslint.org/docs/rules/prefer-numeric-literals
        'prefer-numeric-literals': 'error',

        // Использовать rest-параметры вместо arguments
        // https://eslint.org/docs/rules/prefer-rest-params
        'prefer-rest-params': 'error',

        // Рекомендует spread вместо .apply()
        // https://eslint.org/docs/rules/prefer-spread
        'prefer-spread': 'error',

        // Рекомендует шаблонные строки вместо конкатенации
        // https://eslint.org/docs/rules/prefer-template
        'prefer-template': 'error',

        // Требует описание у Symbol
        // https://eslint.org/docs/rules/symbol-description
        'symbol-description': 'error',

        // babel автоматически вставляет `'use strict';`
        // https://eslint.org/docs/latest/rules/strict
        strict: ['error', 'never'],

        // Нужно ли инициализировать переменную при ее декларации
        // https://eslint.org/docs/latest/rules/init-declarations
        'init-declarations': 'off',

        // Запрет использования CommonJS
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-module.md
        'unicorn/prefer-module': 'off',

        // Обеспечить правильный регистр для чисел
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/number-literal-case.md
        // Отключено, так как управляется Prettier
        'unicorn/number-literal-case': 'off',

        // Запретить запутанные многострочные выражения
        // https://eslint.org/docs/rules/no-unexpected-multiline
        // Отключено, так как управляется Prettier
        'no-unexpected-multiline': 'off',

        // Запрещает использование process.exit там, где это не нужно
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-process-exit.md
        // Отключено, так как не учитывает все возможные варианты где использование допустимо
        'unicorn/no-process-exit': 'off',

        // Запрещает использовать 'window', 'self' и 'global'
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-global-this.md
        'unicorn/prefer-global-this': 'off',

        // Использовать префикс 'node:' для импортов встроенных в nodejs модулей
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-node-protocol.md
        'unicorn/prefer-node-protocol': 'warn',

        // Предпочитать top-level await вместо верхнеуровневых промисов
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-top-level-await.md
        'unicorn/prefer-top-level-await': 'off',
    },
};
