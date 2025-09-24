import { type TSESLint } from '@typescript-eslint/utils';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export const reactConfig: TSESLint.FlatConfig.Config = {
    ...reactPlugin.configs.flat.recommended,
    ...reactHooksPlugin.configs['recommended-latest'],

    name: 'arui-presets-lint/react',
    plugins: {
        react: reactPlugin,
        'react-hooks': reactHooksPlugin,
    },

    settings: {
        react: {
            pragma: 'React',
            version: 'detect',
        },
    },

    rules: {
        // https://github.com/jsx-eslint/eslint-plugin-react?tab=readme-ov-file#list-of-supported-rules
        ...reactPlugin.configs.flat.recommended.rules,

        ...reactHooksPlugin.configs['recommended-latest'].rules,

        // Указывает, какие кавычки использовать в атрибутах JSX (двойные/одинарные)
        // https://eslint.org/docs/rules/jsx-quotes
        'jsx-quotes': ['error', 'prefer-double'],

        // Требует, чтобы методы класса использовали this
        // https://eslint.org/docs/latest/rules/class-methods-use-this
        'class-methods-use-this': [
            'error',
            {
                exceptMethods: [
                    'render',
                    'getInitialState',
                    'getDefaultProps',
                    'getChildContext',
                    'componentWillMount',
                    'UNSAFE_componentWillMount',
                    'componentDidMount',
                    'componentWillReceiveProps',
                    'UNSAFE_componentWillReceiveProps',
                    'shouldComponentUpdate',
                    'componentWillUpdate',
                    'UNSAFE_componentWillUpdate',
                    'componentDidUpdate',
                    'componentWillUnmount',
                    'componentDidCatch',
                    'getSnapshotBeforeUpdate',
                ],
            },
        ],

        // Предотвращает отсутствие displayName в определении React-компонента
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/display-name.md
        'react/display-name': ['off', { ignoreTranspilerName: false }],

        // Запрещает определенные propTypes (any, array, object)
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-prop-types.md
        'react/forbid-prop-types': [
            'error',
            {
                forbid: ['any', 'array', 'object'],
                checkContextTypes: true,
                checkChildContextTypes: true,
            },
        ],

        // Запрещает некоторые пропсы на DOM-узлах
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-dom-props.md
        'react/forbid-dom-props': ['off', { forbid: [] }],

        // Обязывает корректную нотацию булевых атрибутов в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
        'react/jsx-boolean-value': ['error', 'always'],

        // Проверяет расположение закрывающей скобки в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md
        'react/jsx-closing-bracket-location': ['error', 'line-aligned'],

        // Проверяет расположение закрывающего тега в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-closing-tag-location.md
        'react/jsx-closing-tag-location': 'error',

        // Обязывает/запрещает пробелы внутри фигурных скобок в атрибутах JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-spacing.md
        'react/jsx-curly-spacing': ['error', 'never', { allowMultiline: true }],

        // Обязывает соглашения по именованию обработчиков событий в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md
        'react/jsx-handler-names': [
            'off',
            {
                eventHandlerPrefix: 'handle',
                eventHandlerPropPrefix: 'on',
            },
        ],

        // Проверяет отступы пропсов в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-indent-props.md
        'react/jsx-indent-props': ['error', 2],

        // Проверяет наличие key при рендере списков/итераторов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
        // Отключено из-за большого числа ложных срабатываний
        'react/jsx-key': 'off',

        // Ограничивает число пропсов в одной строке JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-max-props-per-line.md
        'react/jsx-max-props-per-line': ['error', { maximum: 1, when: 'multiline' }],

        // Запрещает использование .bind() в пропсах JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md
        'react/jsx-no-bind': [
            'error',
            {
                ignoreRefs: true,
                allowArrowFunctions: true,
                allowFunctions: false,
                allowBind: false,
                ignoreDOMComponents: true,
            },
        ],

        // Запрещает дублирующиеся пропсы в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
        'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],

        // Запрещает не обернутые строки в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-literals.md
        'react/jsx-no-literals': ['off', { noStrings: true }],

        // Запрещает необъявленные переменные в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-undef.md
        'react/jsx-no-undef': 'error',

        // Требует PascalCase для пользовательских JSX-компонентов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
        'react/jsx-pascal-case': [
            'error',
            {
                allowAllCaps: true,
                ignore: [],
            },
        ],

        // Требует алфавитной сортировки propTypes
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/sort-prop-types.md
        'react/sort-prop-types': [
            'off',
            {
                ignoreCase: true,
                callbacksLast: false,
                requiredFirst: false,
                sortShapeProp: true,
            },
        ],

        // Устарело в пользу react/jsx-sort-props
        'react/jsx-sort-prop-types': 'off',

        // Требует алфавитной сортировки пропсов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-sort-props.md
        'react/jsx-sort-props': [
            'off',
            {
                ignoreCase: true,
                callbacksLast: false,
                shorthandFirst: false,
                shorthandLast: false,
                noSortAlphabetically: false,
                reservedFirst: true,
            },
        ],

        // Предотвращает ложную пометку React как неиспользуемого
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-uses-react.md
        'react/jsx-uses-react': ['error'],

        // Предотвращает ложную пометку переменных, используемых в JSX, как неиспользуемых
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-uses-vars.md
        'react/jsx-uses-vars': 'error',

        // Запрещает опасные свойства JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger.md
        'react/no-danger': 'warn',

        // Запрещает устаревшие методы
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-deprecated.md
        'react/no-deprecated': ['error'],

        // Запрещает setState в componentDidMount (необходимо для серверного рендера)
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-did-mount-set-state.md
        'react/no-did-mount-set-state': 'off',

        // Запрещает setState в componentDidUpdate
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-did-update-set-state.md
        'react/no-did-update-set-state': 'error',

        // Запрещает setState в componentWillUpdate
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-will-update-set-state.md
        'react/no-will-update-set-state': 'error',

        // Запрещает прямую мутацию this.state
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-direct-mutation-state.md
        'react/no-direct-mutation-state': 'off',

        // Запрещает использование isMounted
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-is-mounted.md
        'react/no-is-mounted': 'error',

        // Запрещает несколько определений компонентов в одном файле
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md
        'react/no-multi-comp': 'off',

        // Запрещает использование setState
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-set-state.md
        'react/no-set-state': 'off',

        // Запрещает строковые рефы
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md
        'react/no-string-refs': 'error',

        // Запрещает неизвестные DOM-свойства
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
        'react/no-unknown-property': 'error',

        // Требует классы ES6 вместо React.createClass
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prefer-es6-class.md
        'react/prefer-es6-class': ['error', 'always'],

        // Требует функциональные компоненты, если не используются методы жизненного цикла, setState или ref
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prefer-stateless-function.md
        'react/prefer-stateless-function': 'off',

        // Предотвращает отсутствие валидации пропсов в определении компонента
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prop-types.md
        'react/prop-types': 'off',

        // Предотвращает отсутствие импорта React при использовании JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/react-in-jsx-scope.md
        'react/react-in-jsx-scope': 'error',

        // Требует, чтобы методы render() что-то возвращали
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/require-render-return.md
        'react/require-render-return': 'error',

        // Предотвращает лишние закрывающие теги для компонентов без детей
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
        'react/self-closing-comp': 'error',

        // Требует порядок методов компонентов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/sort-comp.md
        'react/sort-comp': 'off',

        // Предотвращает отсутствие скобок вокруг многострочного JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-wrap-multilines.md
        'react/jsx-wrap-multilines': [
            'error',
            {
                declaration: 'parens-new-line',
                assignment: 'parens-new-line',
                return: 'parens-new-line',
                arrow: 'parens-new-line',
                condition: 'parens-new-line',
                logical: 'parens-new-line',
                prop: 'parens-new-line',
            },
        ],

        // Требует перенос первого пропа на новую строку в многострочном JSX-элементе
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-first-prop-new-line.md
        'react/jsx-first-prop-new-line': ['error', 'multiline-multiprop'],

        // Требует пробелы вокруг знака равенства в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-equals-spacing.md
        'react/jsx-equals-spacing': ['error', 'never'],

        // Требует корректные отступы в JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-indent.md
        'react/jsx-indent': ['error', 2],

        // Запрещает target="_blank" на ссылках (или требует защиту)
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-target-blank.md
        'react/jsx-no-target-blank': ['error', { enforceDynamicLinks: 'always' }],

        // Только файлы .jsx могут содержать JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
        'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'], allow: 'as-needed' }],

        // Предотвращает попадание JS-комментариев в JSX как текста
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-comment-textnodes.md
        'react/jsx-no-comment-textnodes': 'error',

        // Запрещает использование значения, возвращаемого React.render/ReactDOM.render
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-render-return-value.md
        'react/no-render-return-value': 'error',

        // Требует shouldComponentUpdate или PureRenderMixin
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/require-optimization.md
        'react/require-optimization': ['off', { allowDecorators: [] }],

        // Предупреждает об использовании findDOMNode()
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-find-dom-node.md
        'react/no-find-dom-node': 'error',

        // Запрещает некоторые пропсы на компонентах
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-component-props.md
        'react/forbid-component-props': ['off', { forbid: [] }],

        // Запрещает некоторые элементы
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-elements.md
        'react/forbid-elements': ['off', { forbid: [] }],

        // Предотвращает проблемы с children и props.dangerouslySetInnerHTML
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-danger-with-children.md
        'react/no-danger-with-children': 'error',

        // Предотвращает неиспользуемые определения propTypes
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
        'react/no-unused-prop-types': [
            'error',
            {
                customValidators: [],
                skipShapeProps: true,
            },
        ],

        // Требует, чтобы значение пропа style было объектом или переменной
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/style-prop-object.md
        'react/style-prop-object': 'error',

        // Предотвращает недопустимые символы в разметке
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unescaped-entities.md
        'react/no-unescaped-entities': 'error',

        // Запрещает передачу children через пропсы
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md
        'react/no-children-prop': 'error',

        // Проверяет пробелы в/вокруг открывающих и закрывающих JSX-тегов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-tag-spacing.md
        'react/jsx-tag-spacing': [
            'error',
            {
                closingSlash: 'never',
                beforeSelfClosing: 'always',
                afterOpening: 'never',
                beforeClosing: 'never',
            },
        ],

        // Запрещает использование индекса массива в ключах
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
        'react/no-array-index-key': 'error',

        // Требует defaultProps для каждого необязательного пропа
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/require-default-props.md
        'react/require-default-props': 'off',

        // Запрещает использовать неэкспортированные propTypes
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/forbid-foreign-prop-types.md
        // Намеренно 'warn'; 'error' критичен только при удалении propTypes в продакшене
        'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],

        // Запрещает дочерние элементы у «пустых» DOM-элементов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
        'react/void-dom-elements-no-children': 'error',

        // Требует, чтобы у всех defaultProps был соответствующий необязательный PropType
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/default-props-match-prop-types.md
        'react/default-props-match-prop-types': ['error', { allowRequiredDefaults: false }],

        // Запрещает shouldComponentUpdate при наследовании React.PureComponent
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-redundant-should-component-update.md
        'react/no-redundant-should-component-update': 'error',

        // Предотвращает неиспользуемые значения state
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-state.md
        'react/no-unused-state': 'error',

        // Обязывает единое именование для булевых пропсов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/boolean-prop-naming.md
        'react/boolean-prop-naming': [
            'off',
            {
                propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'],
                rule: '^(is|has)[A-Z]([A-Za-z0-9]?)+',
                message: '',
            },
        ],

        // Предотвращает типичные опечатки в стиле написания
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-typos.md
        'react/no-typos': 'error',

        // Обязывает/запрещает лишние фигурные скобки в пропсах и/или детях JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
        'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

        // Один JSX-элемент на строку
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-one-expression-per-line.md
        'react/jsx-one-expression-per-line': 'off',

        // Обязывает единообразно использовать деструктуризацию пропсов, state и context
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/destructuring-assignment.md
        'react/destructuring-assignment': 'off',

        // Запрещает использовать this.state внутри this.setState
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-access-state-in-setstate.md
        'react/no-access-state-in-setstate': 'error',

        // Запрещает button без явного атрибута type
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/button-has-type.md
        'react/button-has-type': [
            'error',
            {
                button: true,
                submit: true,
                reset: false,
            },
        ],

        // Гарантирует пробелы между инлайновыми тегами
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-child-element-spacing.md
        'react/jsx-child-element-spacing': 'off',

        // Запрещает использовать this в функциональных компонентах без состояния
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-this-in-sfc.md
        'react/no-this-in-sfc': 'error',

        // Проверяет максимальную вложенность JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-max-depth.md
        'react/jsx-max-depth': 'off',

        // Запрещает множественные пробелы между инлайновыми JSX-пропсами
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-multi-spaces.md
        'react/jsx-props-no-multi-spaces': 'error',

        // Запрещает использование методов с префиксом UNSAFE_
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unsafe.md
        'react/no-unsafe': 'off',

        // Обязывает использовать краткую или стандартную форму фрагментов React
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-fragments.md
        'react/jsx-fragments': ['warn', 'element'],

        // Обязывает переносы строк в фигурных скобках атрибутов/выражений JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-newline.md
        'react/jsx-curly-newline': [
            'error',
            {
                multiline: 'consistent',
                singleline: 'consistent',
            },
        ],

        // Запрещает распыление пропсов JSX
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-props-no-spreading.md
        'react/jsx-props-no-spreading': 'off',

        // Обязывает делать пропсы только для чтения
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prefer-read-only-props.md
        'react/prefer-read-only-props': 'off',

        // Запрещает URL вида `javascript:`
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-script-url.md
        'react/jsx-no-script-url': [
            'error',
            [
                {
                    name: 'Link',
                    props: ['to'],
                },
            ],
        ],

        // Запрещает ненужные фрагменты
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-useless-fragment.md
        'react/jsx-no-useless-fragment': 'error',

        // Обязывает конкретный тип функции для функциональных компонентов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
        'react/function-component-definition': 'off',

        // Обязывает перевод строки после JSX-элементов и выражений
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-newline.md
        'react/jsx-newline': 'off',

        // Предотвращает передачу нестабильных значений в контексты React
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-constructed-context-values.md
        'react/jsx-no-constructed-context-values': 'error',

        // Предотвращает создание нестабильных компонентов внутри компонентов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unstable-nested-components.md
        'react/no-unstable-nested-components': 'error',

        // Требует не использовать пространства имен в элементах React
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-namespace.md
        'react/no-namespace': 'error',

        // Предпочитать точные определения propTypes
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/prefer-exact-props.md
        'react/prefer-exact-props': 'error',

        // Методы жизненного цикла должны быть методами прототипа, а не полями класса
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-arrow-function-lifecycle.md
        'react/no-arrow-function-lifecycle': 'error',

        // Предотвращает использование недопустимых атрибутов
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-invalid-html-attribute.md
        'react/no-invalid-html-attribute': 'error',

        // Предотвращает объявление неиспользуемых методов класса компонента
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-class-component-methods.md
        'react/no-unused-class-component-methods': 'error',

        // Правила хуков (обязательные)
        // https://react.dev/reference/rules/rules-of-hooks
        'react-hooks/rules-of-hooks': 'error',

        // Проверка списка зависимостей для хуков типа useEffect и др.
        // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks#advanced-configuration
        'react-hooks/exhaustive-deps': 'error',

        // Определяет, где должны располагаться статические свойства компонента React
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/static-property-placement.md
        'react/static-property-placement': ['error', 'static public field'],

        // Обеспечить соблюдение стиля инициализации состояния классового компонента
        // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/state-in-constructor.md
        'react/state-in-constructor': ['error', 'never'],
    },
};
