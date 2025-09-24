import { type TSESLint } from '@typescript-eslint/utils';
import checkFilePlugin from 'eslint-plugin-check-file';
import unicornPlugin from 'eslint-plugin-unicorn';

export const bestPracticesConfig: TSESLint.FlatConfig.Config = {
    ...unicornPlugin.configs.recommended,
    name: 'arui-presets-lint/best-practices',
    plugins: {
        unicorn: unicornPlugin,
        'check-file': checkFilePlugin,
    },
    rules: {
        // https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main?tab=readme-ov-file#rules
        ...unicornPlugin.configs.recommended.rules,

        // Требует наличие оператора return в геттерах свойств
        // https://eslint.org/docs/rules/getter-return
        'getter-return': 'off',

        // Запрещает await внутри циклов
        // https://eslint.org/docs/rules/no-await-in-loop
        'no-await-in-loop': 'error',

        // Запрещает присваивание в условных выражениях
        // https://eslint.org/docs/latest/rules/no-cond-assign
        'no-cond-assign': ['error', 'always'],

        // Запрещает использование console
        // https://eslint.org/docs/latest/rules/no-console
        'no-console': 'warn',

        // Запрещает константные выражения в условиях
        // https://eslint.org/docs/latest/rules/no-constant-condition
        'no-constant-condition': 'warn',

        // Запрещает объявления функций/переменных во вложенных блоках
        // https://eslint.org/docs/rules/no-inner-declarations
        'no-inner-declarations': 'error',

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

        // Требует/запрещает заглавную букву в начале комментария
        // https://eslint.org/docs/rules/capitalized-comments
        'capitalized-comments': [
            'off',
            'never',
            {
                line: {
                    ignorePattern: '.*',
                    ignoreInlineComments: true,
                    ignoreConsecutiveComments: true,
                },
                block: {
                    ignorePattern: '.*',
                    ignoreInlineComments: true,
                    ignoreConsecutiveComments: true,
                },
            },
        ],

        // Требует висячие запятые в многострочных литералах объектов
        'comma-dangle': [
            'error',
            {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
            },
        ],

        // Требует единообразных имён при сохранении контекста выполнения
        'consistent-this': 'off',

        // Требует, чтобы имя функции совпадало с именем переменной/свойства, которому она присвоена
        // https://eslint.org/docs/rules/func-name-matching
        'func-name-matching': [
            'off',
            'always',
            {
                includeCommonJSModuleExports: false,
                considerPropertyDescriptor: true,
            },
        ],

        // Требует имя у функциональных выражений
        // https://eslint.org/docs/rules/func-names
        'func-names': 'warn',

        // Запрещает определённые идентификаторы
        // https://eslint.org/docs/rules/id-denylist
        'id-denylist': 'off',

        // Минимальная и максимальная длина идентификаторов (имена переменных, свойств и т.д.)
        // https://eslint.org/docs/rules/id-length
        'id-length': 'off',

        // Требует соответствия идентификаторов регулярному выражению
        // https://eslint.org/docs/rules/id-match
        'id-match': 'off',

        // Максимальная глубина вложенности блоков
        'max-depth': ['off', 4],

        // Максимальное число строк в файле
        // https://eslint.org/docs/rules/max-lines
        'max-lines': ['warn', 300],

        // Максимальная длина функции
        // https://eslint.org/docs/rules/max-lines-per-function
        'max-lines-per-function': [
            'off',
            {
                max: 50,
                skipBlankLines: true,
                skipComments: true,
                IIFEs: true,
            },
        ],

        // Максимальная глубина вложенности колбэков
        // https://eslint.org/docs/rules/max-nested-callbacks
        'max-nested-callbacks': 'warn',

        // Лимит на количество параметров в объявлении функции
        // https://eslint.org/docs/rules/max-params
        'max-params': ['warn', { max: 5, countVoidThis: false }],

        // Максимальное число операторов в функции
        // https://eslint.org/docs/rules/max-statements
        'max-statements': ['off', 10],

        // Лимит числа операторов на строку
        // https://eslint.org/docs/rules/max-statements-per-line
        'max-statements-per-line': ['off', { max: 1 }],

        // Требует определённый стиль многострочных комментариев
        // https://eslint.org/docs/rules/multiline-comment-style
        'multiline-comment-style': ['off', 'starred-block'],

        // Требует заглавную букву у конструкторов
        'new-cap': [
            'error',
            {
                newIsCap: true,
                newIsCapExceptions: [],
                capIsNew: false,
                capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
            },
        ],

        // Запрещает опускать скобки при вызове конструктора без аргументов
        // https://eslint.org/docs/rules/new-parens
        'new-parens': 'error',

        // Разрешить/запретить пустую строку после объявления переменных
        'newline-after-var': 'off',

        // https://eslint.org/docs/rules/newline-before-return
        'newline-before-return': 'off',

        // Требует перевод строки после каждого вызова в цепочке для читаемости
        // https://eslint.org/docs/rules/newline-per-chained-call
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],

        // Запрещает конструктор Array
        // https://eslint.org/docs/rules/no-array-constructor
        'no-array-constructor': 'error',

        // Запрещает побитовые операторы
        // https://eslint.org/docs/rules/no-bitwise
        'no-bitwise': 'error',

        // Запрещает оператор continue
        // https://eslint.org/docs/rules/no-continue
        'no-continue': 'error',

        // Запрещает комментарии в той же строке после кода
        'no-inline-comments': 'off',

        // Запрещает if как единственный оператор в блоке else
        // https://eslint.org/docs/rules/no-lonely-if
        'no-lonely-if': 'error',

        // Запрещает смешивать операторы без скобок
        // https://eslint.org/docs/rules/no-mixed-operators
        'no-mixed-operators': [
            'error',
            {
                // список групп запрещает смешивать `%` и `**` с другими арифм. операторами
                groups: [
                    ['%', '**'],
                    ['%', '+'],
                    ['%', '-'],
                    ['%', '*'],
                    ['%', '/'],
                    ['/', '*'],
                    ['&', '|', '<<', '>>', '>>>'],
                    ['==', '!=', '===', '!=='],
                    ['&&', '||'],
                ],
                allowSamePrecedence: false,
            },
        ],

        // Запрещает смешанные пробелы и табы для отступов
        'no-mixed-spaces-and-tabs': 'error',

        // Запрещает цепочки присваиваний
        // https://eslint.org/docs/rules/no-multi-assign
        'no-multi-assign': ['error'],

        // Запрещает множественные пустые строки; одна в конце и ни одной в начале
        // https://eslint.org/docs/rules/no-multiple-empty-lines
        'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],

        // Запрещает отрицательные условия
        // https://eslint.org/docs/rules/no-negated-condition
        'no-negated-condition': 'warn',

        // Запрещает вложенные тернарные выражения
        'no-nested-ternary': 'error',

        // Запрещает конструктор Object
        'no-new-object': 'error',

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
                selector: 'ForOfStatement',
                message:
                    'iterators/generators require regenerator-runtime, which is too heavyweight for this guide to allow them. Separately, loops should be avoided in favor of array iterations.',
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

        // Запрещает пробел между именем функции и вызовом
        'no-spaced-func': 'error',

        // Полностью запрещает символ табуляции
        'no-tabs': 'error',

        // Запрещает тернарные операторы
        'no-ternary': 'off',

        // Запрещает пробелы в конце строк
        'no-trailing-spaces': [
            'error',
            {
                skipBlankLines: false,
                ignoreComments: false,
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

        // Запрещает пробел перед свойствами
        // https://eslint.org/docs/rules/no-whitespace-before-property
        'no-whitespace-before-property': 'error',

        // Требует расположение однострочных операторов
        // https://eslint.org/docs/rules/nonblock-statement-body-position
        'nonblock-statement-body-position': ['error', 'beside', { overrides: {} }],

        // Требует пробелы внутри фигурных скобок
        'object-curly-spacing': ['error', 'always'],

        // Требует переносы строк между фигурными скобками
        // https://eslint.org/docs/rules/object-curly-newline
        'object-curly-newline': [
            'error',
            {
                ObjectExpression: { minProperties: 4, multiline: true, consistent: true },
                ObjectPattern: { minProperties: 4, multiline: true, consistent: true },
                ImportDeclaration: { minProperties: 4, multiline: true, consistent: true },
                ExportDeclaration: { minProperties: 4, multiline: true, consistent: true },
            },
        ],

        // Требует единый стиль расположения свойств объектов (в строку/на нескольких строках)
        // https://eslint.org/docs/rules/object-property-newline
        'object-property-newline': [
            'error',
            {
                allowAllPropertiesOnSameLine: true,
            },
        ],

        // Разрешает только одно объявление var на функцию
        'one-var': ['error', 'never'],

        // Требует переносы строк вокруг объявления переменных
        // https://eslint.org/docs/rules/one-var-declaration-per-line
        'one-var-declaration-per-line': ['error', 'always'],

        // Требует сокращённую форму присваивания, где возможно
        // https://eslint.org/docs/rules/operator-assignment
        'operator-assignment': ['error', 'always'],

        // Требует оператор в начале строки в многострочных выражениях
        // https://eslint.org/docs/rules/operator-linebreak
        'operator-linebreak': ['error', 'before', { overrides: { '=': 'none' } }],

        // Запрещает пустые строки внутри блоков
        'padded-blocks': [
            'error',
            {
                blocks: 'never',
                classes: 'never',
                switches: 'never',
            },
            {
                allowSingleLineBlocks: true,
            },
        ],

        // Требует/запрещает пустые строки между операторами
        // https://eslint.org/docs/rules/padding-line-between-statements
        'padding-line-between-statements': [
            'warn',
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        ],

        // Запрещает Math.pow в пользу оператора **
        // https://eslint.org/docs/rules/prefer-exponentiation-operator
        'prefer-exponentiation-operator': 'error',

        // Предпочитать spread объектов вместо Object.assign
        // https://eslint.org/docs/rules/prefer-object-spread
        'prefer-object-spread': 'error',

        // Требует кавычки вокруг имён свойств литералов объектов
        // https://eslint.org/docs/rules/quote-props.html
        'quote-props': [
            'error',
            'as-needed',
            { keywords: false, unnecessary: true, numbers: false },
        ],

        // Опредляет, одинарные или двойные ковычки нужно использовать
        quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],

        // Не требует JSDoc
        // https://eslint.org/docs/rules/require-jsdoc
        'require-jsdoc': 'off',

        // Требует/запрещает точку с запятой вместо ASI
        semi: ['error', 'always'],

        // Требует пробелы до и после точки с запятой
        'semi-spacing': ['error', { before: false, after: true }],

        // Требует расположение точки с запятой
        // https://eslint.org/docs/rules/semi-style
        'semi-style': ['error', 'last'],

        // Требует сортировать ключи объектов
        'sort-keys': ['off', 'asc', { caseSensitive: false, natural: true }],

        // Сортировать переменные внутри одного объявления
        'sort-vars': 'off',

        // Требует/запрещает пробел перед блоками
        'space-before-blocks': 'error',

        // Требует/запрещает пробел перед скобкой у функции
        // https://eslint.org/docs/rules/space-before-function-paren
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always',
            },
        ],

        // Требует/запрещает пробелы внутри круглых скобок
        'space-in-parens': ['error', 'never'],

        // Требует пробелы вокруг операторов
        'space-infix-ops': 'error',

        // Требует/запрещает пробелы перед/после унарных операторов
        // https://eslint.org/docs/rules/space-unary-ops
        'space-unary-ops': [
            'error',
            {
                words: true,
                nonwords: false,
                overrides: {},
            },
        ],

        // Требует/запрещает пробел сразу после // или /* в комментарии
        // https://eslint.org/docs/rules/spaced-comment
        'spaced-comment': [
            'error',
            'always',
            {
                line: {
                    exceptions: ['-', '+'],
                    markers: ['=', '!', '/'], // space here to support sprockets directives, slash for TS /// comments
                },
                block: {
                    exceptions: ['-', '+'],
                    markers: ['=', '!', ':', '::'], // space here to support sprockets directives and flow comment types
                    balanced: true,
                },
            },
        ],

        // Требует пробелы вокруг двоеточий в switch
        // https://eslint.org/docs/rules/switch-colon-spacing
        'switch-colon-spacing': ['error', { after: true, before: false }],

        // Требует/запрещает пробелы между template-тегами и литералами
        // https://eslint.org/docs/rules/template-tag-spacing
        'template-tag-spacing': ['error', 'never'],

        // Требует/запрещает BOM (Unicode Byte Order Mark)
        // https://eslint.org/docs/rules/unicode-bom
        'unicode-bom': ['error', 'never'],

        // Требует оборачивать литералы регэкспов в скобки
        'wrap-regex': 'off',

        camelcase: 'off',

        // Все названия файлов должны быть в kebab-case
        'check-file/folder-naming-convention': [
            'error',
            { '**/*.*': 'KEBAB_CASE' },
            { ignoreMiddleExtensions: true },
        ],
        // Все названия папок должны быть в kebab-case
        'check-file/filename-naming-convention': [
            'error',
            { '**/*.*': 'KEBAB_CASE' },
            { ignoreMiddleExtensions: true },
        ],

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

        // Стиль использования фигурных скобок для управляющих конструкций
        // https://eslint.org/docs/rules/curly
        curly: ['error', 'multi-line'], // multiline

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

        // Требует единообразные переносы строк до/после точки
        // https://eslint.org/docs/rules/dot-location
        'dot-location': ['error', 'property'],

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

        // Запрещает лексические объявления в case/default
        // https://eslint.org/docs/rules/no-case-declarations
        'no-case-declarations': 'error',

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

        // Запрещает пустые паттерны деструктуризации
        // https://eslint.org/docs/rules/no-empty-pattern
        'no-empty-pattern': 'error',

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

        // Запрещает неявное «проваливание» между case
        // https://eslint.org/docs/rules/no-fallthrough
        'no-fallthrough': 'error',

        // Запрещает ведущие/замыкающие точки в числовых литералах
        // https://eslint.org/docs/rules/no-floating-decimal
        'no-floating-decimal': 'error',

        // Запрещает переназначение нативных объектов и read-only глобалов
        // https://eslint.org/docs/rules/no-global-assign
        'no-global-assign': ['error', { exceptions: [] }],

        // Устарело в пользу no-global-assign
        // https://eslint.org/docs/rules/no-native-reassign
        'no-native-reassign': 'off',

        // Запрещает неявные преобразования типов
        // https://eslint.org/docs/rules/no-implicit-coercion
        'no-implicit-coercion': [
            'off',
            {
                boolean: false,
                number: true,
                string: true,
                allow: [],
            },
        ],

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

        // Запрещает множественные пробелы
        // https://eslint.org/docs/rules/no-multi-spaces
        'no-multi-spaces': [
            'error',
            {
                ignoreEOLComments: false,
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

        // Запрещает escape-последовательности \8 и \9 в строках
        // https://eslint.org/docs/rules/no-nonoctal-decimal-escape
        'no-nonoctal-decimal-escape': 'error',

        // Запрещает устаревшие восьмеричные литералы
        // https://eslint.org/docs/rules/no-octal
        'no-octal': 'error',

        // Запрещает восьмеричные escape-последовательности в строках, например
        // var foo = 'Copyright \251';
        // https://eslint.org/docs/rules/no-octal-escape
        'no-octal-escape': 'error',

        // Запрещает переназначение параметров функции
        // Запрещает менять объект параметров (за исключением исключений ниже)
        // правило: https://eslint.org/docs/rules/no-param-reassign.html
        'no-param-reassign': [
            'error',
            {
                props: true,
                ignorePropertyModificationsFor: [
                    'acc', // для аккумуляторов reduce
                    'accumulator', // для аккумуляторов reduce
                    'e', // для e.returnvalue
                    'ctx', // для роутинга Koa
                    'context', // для роутинга Koa
                    'req', // для Express-запросов
                    'request', // для Express-запросов
                    'res', // для Express-ответов
                    'response', // для Express-ответов
                    '$scope', // для Angular 1 scopes
                    'staticContext', // для контекста ReactRouter
                ],
            },
        ],

        // Запрещает использование свойства __proto__
        // https://eslint.org/docs/rules/no-proto
        'no-proto': 'error',

        // Запрещает повторное объявление одной и той же переменной
        // https://eslint.org/docs/rules/no-redeclare
        'no-redeclare': 'error',

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

        // Запрещает неиспользуемые метки
        // https://eslint.org/docs/rules/no-unused-labels
        'no-unused-labels': 'error',

        // Запрещает ненужные .call() и .apply()
        // https://eslint.org/docs/rules/no-useless-call
        'no-useless-call': 'off',

        // Запрещает избыточные блоки catch
        // https://eslint.org/docs/rules/no-useless-catch
        'no-useless-catch': 'error',

        // Запрещает бесполезную конкатенацию строк
        // https://eslint.org/docs/rules/no-useless-concat
        'no-useless-concat': 'error',

        // Запрещает избыточные escape-последовательности в строках
        // https://eslint.org/docs/rules/no-useless-escape
        'no-useless-escape': 'error',

        // Запрещает избыточный return
        // https://eslint.org/docs/rules/no-useless-return
        'no-useless-return': 'error',

        // Запрещает оператор void
        // https://eslint.org/docs/rules/no-void
        'no-void': 'error',

        // Запрещает определенные слова-предупреждения в комментариях (например, todo)
        // https://eslint.org/docs/rules/no-warning-comments
        'no-warning-comments': ['off', { terms: ['todo', 'fixme', 'xxx'], location: 'start' }],

        // Запрещает оператор with
        // https://eslint.org/docs/rules/no-with
        'no-with': 'error',

        // Требует использовать объекты Error как причины отклонения Promise
        // https://eslint.org/docs/rules/prefer-promise-reject-errors
        'prefer-promise-reject-errors': ['error', { allowEmptyReject: true }],

        // Рекомендует именованные группы захвата в регулярных выражениях
        // https://eslint.org/docs/rules/prefer-named-capture-group
        'prefer-named-capture-group': 'off',

        // https://eslint.org/docs/rules/prefer-regex-literals
        'prefer-regex-literals': 'off',

        // Требует второй аргумент для parseInt()
        // https://eslint.org/docs/rules/radix
        radix: 'error',

        // Требует `await` в `async function` (не рекомендуется к использованию)
        // https://eslint.org/docs/rules/require-await
        'require-await': 'off',

        // Требует использовать флаг u у RegExp
        // https://eslint.org/docs/rules/require-unicode-regexp
        'require-unicode-regexp': 'off',

        // Требует объявлять все переменные в начале области видимости
        // https://eslint.org/docs/rules/vars-on-top
        'vars-on-top': 'error',

        // Требует оборачивать немедленный вызов функции в скобки
        // https://eslint.org/docs/rules/wrap-iife.html
        'wrap-iife': ['error', 'outside', { functionPrototypeMethods: false }],

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

        // Требует скобки у аргументов стрелочных функций
        // https://eslint.org/docs/rules/arrow-parens
        'arrow-parens': ['error', 'always'],

        // Требует пробел до/после стрелки у стрелочных функций
        // https://eslint.org/docs/rules/arrow-spacing
        'arrow-spacing': ['error', { before: true, after: true }],

        // Проверяет вызов super() в конструкторах
        // https://eslint.org/docs/rules/constructor-super
        'constructor-super': 'off',

        // Требует пробелы вокруг * в генераторах
        // https://eslint.org/docs/rules/generator-star-spacing
        'generator-star-spacing': ['error', { before: false, after: true }],

        // Запрещает модификацию переменных объявлений классов
        // https://eslint.org/docs/rules/no-class-assign
        'no-class-assign': 'error',

        // Запрещает стрелочные функции, когда их можно перепутать со сравнениями
        // https://eslint.org/docs/rules/no-confusing-arrow
        'no-confusing-arrow': [
            'error',
            {
                allowParens: true,
            },
        ],

        // Запрещает модификацию переменных, объявленных через const
        'no-const-assign': 'error',

        // Запрещает дублирование членов класса
        // https://eslint.org/docs/rules/no-dupe-class-members
        'no-dupe-class-members': 'error',

        // Запрещает конструктор Symbol
        // https://eslint.org/docs/rules/no-new-symbol
        'no-new-symbol': 'error',

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
        'prefer-arrow-callback': [
            'error',
            {
                allowNamedFunctions: false,
                allowUnboundThis: true,
            },
        ],

        // Рекомендует const для переменных, не изменяемых после объявления
        'prefer-const': [
            'error',
            {
                destructuring: 'any',
                ignoreReadBeforeAssign: true,
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

        // Рекомендует методы Reflect, когда это уместно
        // https://eslint.org/docs/rules/prefer-reflect
        'prefer-reflect': 'off',

        // Использовать rest-параметры вместо arguments
        // https://eslint.org/docs/rules/prefer-rest-params
        'prefer-rest-params': 'error',

        // Рекомендует spread вместо .apply()
        // https://eslint.org/docs/rules/prefer-spread
        'prefer-spread': 'error',

        // Рекомендует шаблонные строки вместо конкатенации
        // https://eslint.org/docs/rules/prefer-template
        'prefer-template': 'error',

        // Запрещает генераторы без yield
        // https://eslint.org/docs/rules/require-yield
        'require-yield': 'error',

        // Требует пробелы при rest/spread объектов
        // https://eslint.org/docs/rules/rest-spread-spacing
        'rest-spread-spacing': ['error', 'never'],

        // Требует описание у Symbol
        // https://eslint.org/docs/rules/symbol-description
        'symbol-description': 'error',

        // Требует пробелы в шаблонных строках
        // https://eslint.org/docs/rules/template-curly-spacing
        'template-curly-spacing': 'error',

        // Требует пробелы вокруг * в выражениях yield*
        // https://eslint.org/docs/rules/yield-star-spacing
        'yield-star-spacing': ['error', 'after'],

        // babel автоматически вставляет `'use strict';`
        strict: ['error', 'never'],

        // Нужно ли инициализировать переменную при ее декларации
        // https://eslint.org/docs/latest/rules/init-declarations
        'init-declarations': 'off',

        // Предотвращает использование аббривиатур в названии переменных
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v61.0.1/docs/rules/prevent-abbreviations.md
        'unicorn/prevent-abbreviations': 'off',

        // Запрет использования Array reduce
        // https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v61.0.1/docs/rules/no-array-reduce.md
        'unicorn/no-array-reduce': 'off',
    },
};
