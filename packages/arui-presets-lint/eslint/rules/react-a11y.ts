import { type Linter } from 'eslint';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y-x';

import { REACT_SCRIPTS_SCOPE } from '../constants.js';

export const reactA11yConfig: Linter.Config = {
    ...jsxA11yPlugin.configs.recommended,
    name: 'arui-presets-lint/react-a11y',
    files: [REACT_SCRIPTS_SCOPE],
    plugins: {
        'jsx-a11y-x': jsxA11yPlugin,
    },
    settings: {
        'jsx-a11y-x': {
            components: {
                Button: 'button',
                IconButton: 'button',
                PickerButton: 'button',
                PickerButtonMobile: 'button',
                PickerButtonDesktop: 'button',
                ActionButton: 'button',
                CustomButton: 'button',
                CustomButtonDesktop: 'button',
                CustomButtonMobile: 'button',
            },
        },
    },

    rules: {
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x?tab=readme-ov-file#supported-rules
        ...jsxA11yPlugin.configs.recommended.rules,

        // Требует, чтобы у элементов, требующих alt-текст, он был осмысленным
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/alt-text.md
        'jsx-a11y-x/alt-text': [
            'error',
            {
                elements: ['img', 'object', 'area', 'input[type="image"]'],
                img: [],
                object: [],
                area: [],
                'input[type="image"]': [],
            },
        ],

        // Требует, чтобы ссылки имели содержимое
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/anchor-has-content.md
        'jsx-a11y-x/anchor-has-content': ['error', { components: [] }],

        // Гарантирует корректность тегов <a>
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/anchor-is-valid.md
        'jsx-a11y-x/anchor-is-valid': ['warn', { aspects: ['invalidHref'] }],

        // Элементы с aria-activedescendant должны быть доступны по Tab
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/aria-activedescendant-has-tabindex.md
        'jsx-a11y-x/aria-activedescendant-has-tabindex': 'error',

        // Требует валидности всех aria-* свойств
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/aria-props.md
        'jsx-a11y-x/aria-props': 'error',

        // Требует валидности значений ARIA-состояний и свойств
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/aria-proptypes.md
        'jsx-a11y-x/aria-proptypes': 'error',

        // Требует валидные и не абстрактные ARIA-роли
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/aria-role.md
        'jsx-a11y-x/aria-role': ['error', { ignoreNonDOM: false }],

        // Требует, чтобы элементы без поддержки ролей/состояний/свойств ARIA не содержали их
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/aria-unsupported-elements.md
        'jsx-a11y-x/aria-unsupported-elements': 'error',

        // Гарантирует корректность и уместность атрибута autocomplete
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/autocomplete-valid.md
        'jsx-a11y-x/autocomplete-valid': [
            'off',
            {
                inputComponents: [],
            },
        ],

        // Требует сопровождать onClick обработчиками onKeyUp/onKeyDown/onKeyPress
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/click-events-have-key-events.md
        'jsx-a11y-x/click-events-have-key-events': 'error',

        // Требует текстовую метку у интерактивных элементов
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/control-has-associated-label.md
        'jsx-a11y-x/control-has-associated-label': [
            'error',
            {
                labelAttributes: ['label'],
                controlComponents: [],
                ignoreElements: ['audio', 'canvas', 'embed', 'input', 'textarea', 'tr', 'video'],
                ignoreRoles: [
                    'grid',
                    'listbox',
                    'menu',
                    'menubar',
                    'radiogroup',
                    'row',
                    'tablist',
                    'toolbar',
                    'tree',
                    'treegrid',
                ],
                depth: 5,
            },
        ],

        // Гарантирует, что <hX> имеют содержимое и не скрыты aria-hidden
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/heading-has-content.md
        'jsx-a11y-x/heading-has-content': ['error', { components: [''] }],

        // Требует наличие корректного атрибута lang у HTML-элементов
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/html-has-lang.md
        'jsx-a11y-x/html-has-lang': 'error',

        // Гарантирует уникальный title для iframe
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/iframe-has-title.md
        'jsx-a11y-x/iframe-has-title': 'error',

        // Предотвращает избыточные слова в alt у img (image, picture, photo)
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/img-redundant-alt.md
        'jsx-a11y-x/img-redundant-alt': 'error',

        // Элементы с интерактивной ролью и хэндлерами должны получать фокус
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/interactive-supports-focus.md
        'jsx-a11y-x/interactive-supports-focus': 'error',

        // Требует, чтобы label имел текст и связан с контролом
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/label-has-associated-control.md
        'jsx-a11y-x/label-has-associated-control': [
            'error',
            { labelComponents: ['label'], assert: 'either' },
        ],

        // Требует валидный атрибут lang у HTML-элементов
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/lang.md
        'jsx-a11y-x/lang': 'error',

        // Медиа-элементы должны иметь субтитры
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/media-has-caption.md
        'jsx-a11y-x/media-has-caption': [
            'error',
            {
                audio: [],
                video: [],
                track: [],
            },
        ],

        // Требует сопровождать mouseover/out обработчиками focus/blur
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/mouse-events-have-key-events.md
        'jsx-a11y-x/mouse-events-have-key-events': 'error',

        // Запрещает использовать `accessKey`
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-access-key.md
        'jsx-a11y-x/no-access-key': 'error',

        // Запрещает prop autoFocus
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-autofocus.md
        'jsx-a11y-x/no-autofocus': ['error', { ignoreNonDOM: true }],

        // Запрещает отвлекающие элементы (<marquee>, <blink>)
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-distracting-elements.md
        'jsx-a11y-x/no-distracting-elements': [
            'error',
            {
                elements: ['marquee', 'blink'],
            },
        ],

        // Роли WAI-ARIA нельзя использовать для превращения интерактивного элемента в неинтерактивный
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-interactive-element-to-noninteractive-role.md
        'jsx-a11y-x/no-interactive-element-to-noninteractive-role': [
            'error',
            {
                tr: ['none', 'presentation'],
            },
        ],

        // Неинтерактивные элементы не должны иметь обработчики событий
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-noninteractive-element-interactions.md
        'jsx-a11y-x/no-noninteractive-element-interactions': [
            'error',
            {
                handlers: [
                    'onClick',
                    'onMouseDown',
                    'onMouseUp',
                    'onKeyPress',
                    'onKeyDown',
                    'onKeyUp',
                ],
            },
        ],

        // Роли WAI-ARIA нельзя использовать для превращения неинтерактивного элемента в интерактивный
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-noninteractive-element-to-interactive-role.md
        'jsx-a11y-x/no-noninteractive-element-to-interactive-role': [
            'error',
            {
                ul: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
                ol: ['listbox', 'menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
                li: ['menuitem', 'option', 'row', 'tab', 'treeitem'],
                table: ['grid'],
                td: ['gridcell'],
            },
        ],

        // Перемещение по Tab должно быть ограничено интерактивными элементами страницы
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-noninteractive-tabindex.md
        'jsx-a11y-x/no-noninteractive-tabindex': [
            'error',
            {
                tags: [],
                roles: ['tabpanel'],
            },
        ],

        // Элементы html не должны включать избыточные ARIA-роли
        // http://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-redundant-roles.md
        'jsx-a11y-x/no-redundant-roles': 'error',

        // Обеспечивает отсутствие обработчиков взаимодействия на элементах без семантического поведения
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/no-static-element-interactions.md
        'jsx-a11y-x/no-static-element-interactions': [
            'error',
            {
                handlers: [
                    'onClick',
                    'onMouseDown',
                    'onMouseUp',
                    'onKeyPress',
                    'onKeyDown',
                    'onKeyUp',
                ],
            },
        ],

        // Обеспечивает наличие всех требуемых атрибутов у элементов с ролями ARIA
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/role-has-required-aria-props.md
        'jsx-a11y-x/role-has-required-aria-props': 'error',

        // Требует, чтобы элементы с явно или неявно определенными ролями содержали только свойства aria-*,
        // поддерживаемые этой ролью
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/role-has-required-aria-props.md
        'jsx-a11y-x/role-supports-aria-props': 'error',

        // Разрешить только <th> иметь атрибут «scope»
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/scope.md
        'jsx-a11y-x/scope': 'error',

        // Запретить установку значения tabIndex больше 0
        // https://github.com/eslint-community/eslint-plugin-jsx-a11y-x/blob/main/docs/rules/tabindex-no-positive.md
        'jsx-a11y-x/tabindex-no-positive': 'error',
    },
};
