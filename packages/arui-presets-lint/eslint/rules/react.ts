import { type Linter } from 'eslint';
import reactDOMPlugin from 'eslint-plugin-react-dom';
import reactJSXPlugin from 'eslint-plugin-react-jsx';
import reactPlugin from 'eslint-plugin-react-x';
import reactYouMightNotNeedAnEffectPlugin from 'eslint-plugin-react-you-might-not-need-an-effect';

import { REACT_SCRIPTS_SCOPE } from '../constants.js';

export const reactConfig: Linter.Config = {
    name: 'arui-presets-lint/react',
    files: [REACT_SCRIPTS_SCOPE],
    languageOptions: {
        parserOptions: {
            ecmaFeatures: { jsx: true },
        },
    },
    plugins: {
        'react-x': reactPlugin,
        'react-dom': reactDOMPlugin,
        'react-jsx': reactJSXPlugin,
        'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffectPlugin,
    },
    settings: reactPlugin.configs.recommended.settings,

    rules: {
        // Переносим прежние проверки явно: recommended добавляет новые ограничения
        // и дублирует правила из отдельного reactHooksConfig.
        // https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react

        // Эвристики поиска лишних useEffect: derived state, цепочки обновлений state,
        // логика обработчиков событий в эффектах и т.д. Все правила рекомендованного
        // конфига, уровень warn - у правил возможны ложные срабатывания
        // https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect
        ...reactYouMightNotNeedAnEffectPlugin.configs.recommended.rules,

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

        // Предупреждает об использовании dangerouslySetInnerHTML
        // https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml
        'react-dom/no-dangerously-set-innerhtml': 'warn',

        // Запрещает устаревшие методы жизненного цикла
        // https://eslint-react.xyz/docs/rules/no-component-will-mount
        'react-x/no-component-will-mount': 'error',
        // https://eslint-react.xyz/docs/rules/no-component-will-receive-props
        'react-x/no-component-will-receive-props': 'error',
        // https://eslint-react.xyz/docs/rules/no-component-will-update
        'react-x/no-component-will-update': 'error',

        // Запрещает устаревшие ReactDOM.render и ReactDOM.hydrate
        // https://eslint-react.xyz/docs/rules/dom-no-render
        'react-dom/no-render': 'error',
        // https://eslint-react.xyz/docs/rules/dom-no-hydrate
        'react-dom/no-hydrate': 'error',

        // Запрещает setState в componentDidUpdate и componentWillUpdate
        // https://eslint-react.xyz/docs/rules/no-set-state-in-component-did-update
        'react-x/no-set-state-in-component-did-update': 'error',
        // https://eslint-react.xyz/docs/rules/no-set-state-in-component-will-update
        'react-x/no-set-state-in-component-will-update': 'error',

        // Запрещает неизвестные DOM-свойства
        // https://eslint-react.xyz/docs/rules/dom-no-unknown-property
        'react-dom/no-unknown-property': 'error',

        // Требует noreferrer для внешних ссылок с target="_blank"
        // https://eslint-react.xyz/docs/rules/dom-no-unsafe-target-blank
        'react-dom/no-unsafe-target-blank': 'error',

        // Предотвращает попадание JS-комментариев в JSX как текста
        // https://eslint-react.xyz/docs/rules/jsx-no-comment-textnodes
        'react-jsx/no-comment-textnodes': 'error',

        // Запрещает использование значения, возвращаемого ReactDOM.render
        // https://eslint-react.xyz/docs/rules/dom-no-render-return-value
        'react-dom/no-render-return-value': 'error',

        // Запрещает использование findDOMNode
        // https://eslint-react.xyz/docs/rules/dom-no-find-dom-node
        'react-dom/no-find-dom-node': 'error',

        // Запрещает одновременную передачу children и dangerouslySetInnerHTML
        // https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml-with-children
        'react-dom/no-dangerously-set-innerhtml-with-children': 'error',

        // Запрещает строковый style на DOM-элементах
        // https://eslint-react.xyz/docs/rules/dom-no-string-style-prop
        'react-dom/no-string-style-prop': 'error',

        // Запрещает передачу children через пропсы
        // https://eslint-react.xyz/docs/rules/jsx-no-children-prop
        'react-jsx/no-children-prop': 'error',

        // Запрещает использование индекса массива в ключах
        // https://eslint-react.xyz/docs/rules/no-array-index-key
        'react-x/no-array-index-key': 'error',

        // Запрещает дочерние элементы у «пустых» DOM-элементов
        // https://eslint-react.xyz/docs/rules/dom-no-void-elements-with-children
        'react-dom/no-void-elements-with-children': 'error',

        // Запрещает использовать this.state внутри this.setState
        // https://eslint-react.xyz/docs/rules/no-access-state-in-setstate
        'react-x/no-access-state-in-setstate': 'error',

        // Требует явный атрибут type у button
        // https://eslint-react.xyz/docs/rules/dom-no-missing-button-type
        'react-dom/no-missing-button-type': 'error',

        // Запрещает URL вида javascript: в JSX-атрибутах, включая Link.to
        // https://eslint-react.xyz/docs/rules/dom-no-script-url
        'react-dom/no-script-url': 'error',

        // Запрещает ненужные фрагменты, но разрешает одиночные выражения в них
        // https://eslint-react.xyz/docs/rules/jsx-no-useless-fragment
        'react-jsx/no-useless-fragment': ['error', { allowExpressions: true }],

        // Предотвращает передачу нестабильных значений в контексты React
        // https://eslint-react.xyz/docs/rules/no-unstable-context-value
        'react-x/no-unstable-context-value': 'error',

        // Предотвращает создание нестабильных компонентов внутри компонентов
        // https://eslint-react.xyz/docs/rules/no-nested-component-definitions
        'react-x/no-nested-component-definitions': 'error',

        // Запрещает пространства имен в JSX
        // https://eslint-react.xyz/docs/rules/jsx-no-namespace
        'react-jsx/no-namespace': 'error',

        // Предотвращает неиспользуемые методы и свойства классовых компонентов
        // https://eslint-react.xyz/docs/rules/no-unused-class-component-members
        'react-x/no-unused-class-component-members': 'error',
    },
};
