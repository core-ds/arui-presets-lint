import { type Config } from 'stylelint';

import cssModulesPlugins from './css-modules.js';

const keywordCaseOptions = {
    // Эти свойства содержат имена, регистр которых влияет на ссылки на них.
    ignoreProperties: [
        /^--/,
        'composes',
        'grid',
        /^grid-template(?:-(?:rows|columns|areas))?$/,
        'container',
        'container-name',
        'counter-set',
        'view-transition-name',
        'view-transition-class',
        'page',
        'color-scheme',
    ],
    ignoreKeywords: [/^--/],
    camelCaseSvgKeywords: true,
};

export default {
    // Требует объяснять отключения правил
    // https://stylelint.io/user-guide/configure/#reportdescriptionlessdisables
    reportDescriptionlessDisables: true,

    // Запрещает отключения правил, которые больше не нужны
    // https://stylelint.io/user-guide/configure/#reportneedlessdisables
    reportNeedlessDisables: true,

    rules: {
        // Требует числовую запись прозрачности вместо процентов
        // https://stylelint.io/user-guide/rules/alpha-value-notation
        'alpha-value-notation': 'number',

        // Запрещает пустые блоки
        // https://stylelint.io/user-guide/rules/block-no-empty
        'block-no-empty': true,

        // Требует короткую форму hex-цветов
        // https://stylelint.io/user-guide/rules/color-hex-length
        'color-hex-length': 'short',

        // Запрещает невалидные hex-цвета
        // https://stylelint.io/user-guide/rules/color-no-invalid-hex
        'color-no-invalid-hex': true,

        // Требует пустую строку перед комментариями
        // https://stylelint.io/user-guide/rules/comment-empty-line-before
        'comment-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['stylelint-commands'],
            },
        ],

        // Запрещает пустые комментарии
        // https://stylelint.io/user-guide/rules/comment-no-empty
        'comment-no-empty': true,

        // Требует пробелы внутри комментариев
        // https://stylelint.io/user-guide/rules/comment-whitespace-inside
        'comment-whitespace-inside': 'always',

        // Требует пустую строку перед custom properties
        // https://stylelint.io/user-guide/rules/custom-property-empty-line-before
        'custom-property-empty-line-before': [
            'always',
            {
                except: ['after-custom-property', 'first-nested'],
                ignore: ['after-comment', 'inside-single-line-block'],
            },
        ],

        // Запрещает переопределение shorthand-свойств длинными формами
        // https://stylelint.io/user-guide/rules/declaration-block-no-shorthand-property-overrides
        'declaration-block-no-shorthand-property-overrides': true,

        // Ограничивает количество деклараций в однострочном блоке
        // https://stylelint.io/user-guide/rules/declaration-block-single-line-max-declarations
        'declaration-block-single-line-max-declarations': 2,

        // Запрещает !important в декларациях
        // https://stylelint.io/user-guide/rules/declaration-no-important
        'declaration-no-important': true,

        // Запрещает неизвестные значения CSS-свойств
        // https://stylelint.io/user-guide/rules/declaration-property-value-no-unknown
        'declaration-property-value-no-unknown': true,

        // Требует числовой вес шрифта, сохраняя относительные значения lighter и bolder
        // https://stylelint.io/user-guide/rules/font-weight-notation
        'font-weight-notation': ['numeric', { ignore: ['relative'] }],

        // Требует пробелы вокруг операторов в calc()
        // https://stylelint.io/user-guide/rules/function-calc-no-unspaced-operator
        'function-calc-no-unspaced-operator': true,

        // Запрещает нестандартные направления в linear-gradient()
        // https://stylelint.io/user-guide/rules/function-linear-gradient-no-nonstandard-direction
        'function-linear-gradient-no-nonstandard-direction': true,

        // Требует нижний регистр для имeн функций
        // https://stylelint.io/user-guide/rules/function-name-case
        'function-name-case': 'lower',

        // Требует кавычки вокруг URL
        // https://stylelint.io/user-guide/rules/function-url-quotes
        'function-url-quotes': 'always',

        // Требует строковую форму @import
        // https://stylelint.io/user-guide/rules/import-notation
        'import-notation': 'string',

        // Запрещает !important в keyframe-декларациях
        // https://stylelint.io/user-guide/rules/keyframe-declaration-no-important
        'keyframe-declaration-no-important': true,

        // Запрещает единицы измерения для нулевых значений длины
        // https://stylelint.io/user-guide/rules/length-zero-no-unit
        'length-zero-no-unit': true,

        // Запрещает пустые исходники
        // https://stylelint.io/user-guide/rules/no-empty-source
        'no-empty-source': true,

        // Запрещает невалидные двойные слэш-комментарии
        // https://stylelint.io/user-guide/rules/no-invalid-double-slash-comments
        'no-invalid-double-slash-comments': true,

        // Запрещает сокращенное свойство background, требуя отдельные свойства фона
        // https://stylelint.io/user-guide/rules/property-disallowed-list
        'property-disallowed-list': ['background'],

        // Запрещает неизвестные CSS-свойства
        // https://stylelint.io/user-guide/rules/property-no-unknown
        'property-no-unknown': true,

        // Запрещает неизвестные псевдоклассы
        // https://stylelint.io/user-guide/rules/selector-pseudo-class-no-unknown
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],

        // Требует одинарную нотацию для псевдоэлементов (:)
        // https://stylelint.io/user-guide/rules/selector-pseudo-element-colon-notation
        'selector-pseudo-element-colon-notation': 'single',

        // Запрещает неизвестные псевдоэлементы
        // https://stylelint.io/user-guide/rules/selector-pseudo-element-no-unknown
        'selector-pseudo-element-no-unknown': true,

        // Требует нижний регистр для селекторов типов
        // https://stylelint.io/user-guide/rules/selector-type-case
        'selector-type-case': 'lower',

        // Запрещает неизвестные селекторы типов
        // https://stylelint.io/user-guide/rules/selector-type-no-unknown
        'selector-type-no-unknown': true,

        // Запрещает избыточные значения в shorthand-свойствах
        // https://stylelint.io/user-guide/rules/shorthand-property-no-redundant-values
        'shorthand-property-no-redundant-values': true,

        // Запрещает переносы строк в строках
        // https://stylelint.io/user-guide/rules/string-no-newline
        'string-no-newline': true,

        // Запрещает неизвестные единицы измерения
        // https://stylelint.io/user-guide/rules/unit-no-unknown
        'unit-no-unknown': true,

        // Требует нижний регистр ключевых слов, сохраняя пользовательские имена
        // https://stylelint.io/user-guide/rules/value-keyword-case
        'value-keyword-case': ['lower', keywordCaseOptions],

        // Запрещает дублирующиеся селекторы
        // https://stylelint.io/user-guide/rules/no-duplicate-selectors
        'no-duplicate-selectors': true,

        // Запрещает повторное объявление CSS-переменной в одном блоке
        // https://stylelint.io/user-guide/rules/declaration-block-no-duplicate-custom-properties
        'declaration-block-no-duplicate-custom-properties': true,

        // Запрещает дублирующиеся свойства в блоке
        // https://stylelint.io/user-guide/rules/declaration-block-no-duplicate-properties
        'declaration-block-no-duplicate-properties': [
            true,
            {
                ignore: ['consecutive-duplicates-with-different-syntaxes'],
            },
        ],

        // Требует использовать CSS-переменные дизайн-системы вместо хардкода
        // https://github.com/core-ds/arui-presets-lint/tree/master/packages/stylelint-core-vars
        'stylelint-core-vars/use-vars': true,

        // Требует использовать миксины дизайн-системы
        // https://github.com/core-ds/arui-presets-lint/tree/master/packages/stylelint-core-vars
        'stylelint-core-vars/use-mixins': true,

        // Рекомендует использовать один из доступных vars при выборе значения
        // https://github.com/core-ds/arui-presets-lint/tree/master/packages/stylelint-core-vars
        'stylelint-core-vars/use-one-of-vars': [true, { severity: 'warning' }],

        // Рекомендует использовать один из доступных mixins при выборе
        // https://github.com/core-ds/arui-presets-lint/tree/master/packages/stylelint-core-vars
        'stylelint-core-vars/use-one-of-mixins': [true, { severity: 'warning' }],

        // Предупреждает об использовании тeмных цветов напрямую
        // https://github.com/core-ds/arui-presets-lint/tree/master/packages/stylelint-core-vars
        'stylelint-core-vars/do-not-use-dark-colors': [true, { severity: 'warning' }],

        // Требует пустую строку перед правилами
        // https://stylelint.io/user-guide/rules/rule-empty-line-before
        'rule-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['after-comment'],
            },
        ],

        // Требует порядок: позиционирование, раскладка, размеры, отступы, текст, оформление, эффекты, взаимодействие
        // https://github.com/hudochenkov/stylelint-order/blob/master/rules/properties-order/README.md
        'order/properties-order': [
            [
                // Композиция классов и общий сброс
                'composes',
                'all',

                // Позиционирование
                'position',
                'z-index',
                'inset',
                'inset-block',
                'inset-block-start',
                'inset-block-end',
                'inset-inline',
                'inset-inline-start',
                'inset-inline-end',
                'top',
                'right',
                'bottom',
                'left',

                // Раскладка
                'display',
                'box-sizing',
                'float',
                'clear',
                'isolation',
                'contain',
                'content-visibility',
                'container',
                'container-name',
                'container-type',
                'flex',
                'flex-grow',
                'flex-shrink',
                'flex-basis',
                'flex-flow',
                'flex-direction',
                'flex-wrap',
                'grid',
                'grid-template',
                'grid-template-areas',
                'grid-template-rows',
                'grid-template-columns',
                'grid-auto-flow',
                'grid-auto-rows',
                'grid-auto-columns',
                'grid-area',
                'grid-row',
                'grid-row-start',
                'grid-row-end',
                'grid-column',
                'grid-column-start',
                'grid-column-end',
                'gap',
                'row-gap',
                'column-gap',
                'place-content',
                'justify-content',
                'align-content',
                'place-items',
                'justify-items',
                'align-items',
                'place-self',
                'justify-self',
                'align-self',
                'order',
                'columns',
                'column-count',
                'column-width',
                'column-fill',
                'column-span',
                'column-rule',
                'column-rule-width',
                'column-rule-style',
                'column-rule-color',
                'table-layout',
                'caption-side',
                'empty-cells',

                // Размеры и переполнение
                'width',
                'min-width',
                'max-width',
                'height',
                'min-height',
                'max-height',
                'inline-size',
                'min-inline-size',
                'max-inline-size',
                'block-size',
                'min-block-size',
                'max-block-size',
                'aspect-ratio',
                'contain-intrinsic-size',
                'contain-intrinsic-width',
                'contain-intrinsic-height',
                'contain-intrinsic-inline-size',
                'contain-intrinsic-block-size',
                'overflow',
                'overflow-x',
                'overflow-y',
                'overflow-block',
                'overflow-inline',
                'overflow-clip-margin',
                'overscroll-behavior',
                'overscroll-behavior-x',
                'overscroll-behavior-y',
                'overscroll-behavior-block',
                'overscroll-behavior-inline',
                'object-fit',
                'object-position',

                // Отступы: общая запись, физические стороны, логические стороны
                'margin',
                'margin-top',
                'margin-right',
                'margin-bottom',
                'margin-left',
                'margin-block',
                'margin-block-start',
                'margin-block-end',
                'margin-inline',
                'margin-inline-start',
                'margin-inline-end',
                'padding',
                'padding-top',
                'padding-right',
                'padding-bottom',
                'padding-left',
                'padding-block',
                'padding-block-start',
                'padding-block-end',
                'padding-inline',
                'padding-inline-start',
                'padding-inline-end',
                'scroll-margin',
                'scroll-margin-top',
                'scroll-margin-right',
                'scroll-margin-bottom',
                'scroll-margin-left',
                'scroll-margin-block',
                'scroll-margin-block-start',
                'scroll-margin-block-end',
                'scroll-margin-inline',
                'scroll-margin-inline-start',
                'scroll-margin-inline-end',
                'scroll-padding',
                'scroll-padding-top',
                'scroll-padding-right',
                'scroll-padding-bottom',
                'scroll-padding-left',
                'scroll-padding-block',
                'scroll-padding-block-start',
                'scroll-padding-block-end',
                'scroll-padding-inline',
                'scroll-padding-inline-start',
                'scroll-padding-inline-end',

                // Текст
                'font',
                'font-family',
                'font-size',
                'font-size-adjust',
                'font-style',
                'font-weight',
                'font-stretch',
                'font-variant',
                'font-variant-ligatures',
                'font-variant-caps',
                'font-variant-numeric',
                'font-variant-east-asian',
                'font-variant-position',
                'font-variant-alternates',
                'font-variant-emoji',
                'font-feature-settings',
                'font-variation-settings',
                'font-kerning',
                'font-optical-sizing',
                'font-synthesis',
                'font-synthesis-weight',
                'font-synthesis-style',
                'font-synthesis-small-caps',
                'font-synthesis-position',
                'line-height',
                'line-clamp',
                'text-align',
                'text-align-last',
                'text-justify',
                'text-indent',
                'text-transform',
                'text-decoration',
                'text-decoration-line',
                'text-decoration-style',
                'text-decoration-color',
                'text-decoration-thickness',
                'text-underline-position',
                'text-underline-offset',
                'text-shadow',
                'text-overflow',
                'text-rendering',
                'text-orientation',
                'white-space',
                'white-space-collapse',
                'text-wrap',
                'text-wrap-mode',
                'text-wrap-style',
                'word-wrap',
                'overflow-wrap',
                'word-break',
                'line-break',
                'hyphens',
                'tab-size',
                'letter-spacing',
                'word-spacing',
                'direction',
                'unicode-bidi',
                'writing-mode',
                'vertical-align',
                'color',

                // Оформление
                'content',
                'quotes',
                'counter-reset',
                'counter-increment',
                'counter-set',
                'background-color',
                'background-image',
                'background-position',
                'background-position-x',
                'background-position-y',
                'background-size',
                'background-repeat',
                'background-attachment',
                'background-origin',
                'background-clip',
                'background-blend-mode',
                'border',
                'border-width',
                'border-style',
                'border-color',
                'border-top',
                'border-top-width',
                'border-top-style',
                'border-top-color',
                'border-right',
                'border-right-width',
                'border-right-style',
                'border-right-color',
                'border-bottom',
                'border-bottom-width',
                'border-bottom-style',
                'border-bottom-color',
                'border-left',
                'border-left-width',
                'border-left-style',
                'border-left-color',
                'border-block',
                'border-block-width',
                'border-block-style',
                'border-block-color',
                'border-block-start',
                'border-block-start-width',
                'border-block-start-style',
                'border-block-start-color',
                'border-block-end',
                'border-block-end-width',
                'border-block-end-style',
                'border-block-end-color',
                'border-inline',
                'border-inline-width',
                'border-inline-style',
                'border-inline-color',
                'border-inline-start',
                'border-inline-start-width',
                'border-inline-start-style',
                'border-inline-start-color',
                'border-inline-end',
                'border-inline-end-width',
                'border-inline-end-style',
                'border-inline-end-color',
                'border-radius',
                'border-top-left-radius',
                'border-top-right-radius',
                'border-bottom-right-radius',
                'border-bottom-left-radius',
                'border-start-start-radius',
                'border-start-end-radius',
                'border-end-start-radius',
                'border-end-end-radius',
                'border-image',
                'border-image-source',
                'border-image-slice',
                'border-image-width',
                'border-image-outset',
                'border-image-repeat',
                'border-collapse',
                'border-spacing',
                'outline',
                'outline-width',
                'outline-style',
                'outline-color',
                'outline-offset',
                'box-shadow',
                'fill',
                'fill-opacity',
                'fill-rule',
                'stroke',
                'stroke-width',
                'stroke-linecap',
                'stroke-linejoin',
                'stroke-miterlimit',
                'stroke-dasharray',
                'stroke-dashoffset',
                'stroke-opacity',
                'paint-order',
                'vector-effect',
                'shape-rendering',
                'stop-color',
                'stop-opacity',
                'flood-color',
                'flood-opacity',
                'lighting-color',

                // Эффекты и анимация
                'visibility',
                'opacity',
                'mix-blend-mode',
                'transform',
                'transform-origin',
                'transform-style',
                'transform-box',
                'translate',
                'rotate',
                'scale',
                'perspective',
                'perspective-origin',
                'backface-visibility',
                'filter',
                'backdrop-filter',
                'clip',
                'clip-path',
                'mask',
                'mask-image',
                'mask-mode',
                'mask-position',
                'mask-size',
                'mask-repeat',
                'mask-origin',
                'mask-clip',
                'mask-composite',
                'mask-type',
                'will-change',
                'transition',
                'transition-property',
                'transition-duration',
                'transition-timing-function',
                'transition-delay',
                'transition-behavior',
                'animation',
                'animation-name',
                'animation-duration',
                'animation-timing-function',
                'animation-delay',
                'animation-iteration-count',
                'animation-direction',
                'animation-fill-mode',
                'animation-play-state',
                'animation-timeline',
                'animation-range',
                'animation-range-start',
                'animation-range-end',

                // Взаимодействие
                'appearance',
                'cursor',
                'pointer-events',
                'user-select',
                'touch-action',
                'resize',
                'scroll-behavior',
                'scroll-snap-type',
                'scroll-snap-align',
                'scroll-snap-stop',
                'scrollbar-width',
                'scrollbar-color',
                'scrollbar-gutter',
            ],
            { unspecified: 'bottomAlphabetical' },
        ],

        // Требует порядок: CSS-переменные > декларации > @media > псевдоэлементы > псевдоклассы > &__ > вложенные классы
        // https://github.com/hudochenkov/stylelint-order/blob/master/rules/order/README.md
        'order/order': [
            [
                'custom-properties',
                'declarations',
                {
                    type: 'at-rule',
                    name: 'media',
                },
                {
                    type: 'rule',
                    selector: '^&::(before|after)',
                },
                {
                    type: 'rule',
                    selector: String.raw`^&:\w`,
                },
                {
                    type: 'rule',
                    selector: '^&_',
                },
                {
                    type: 'rule',
                    selector: '^.',
                },
            ],
            { severity: 'warning' },
        ],
    },
    plugins: ['stylelint-order', '@alfalab/stylelint-core-vars', ...cssModulesPlugins],
    overrides: [
        {
            files: ['*.module.css'],
            rules: {
                // Версии штатных правил, учитывающие объявления и импорты @value
                // https://github.com/css-modules/postcss-modules-values
                'declaration-property-value-no-unknown': null,
                'arui-presets-lint/declaration-property-value-no-unknown': true,
                'value-keyword-case': null,
                'arui-presets-lint/value-keyword-case': ['lower', keywordCaseOptions],

                // Разрешает композицию классов CSS Modules
                // https://stylelint.io/user-guide/rules/property-no-unknown
                'property-no-unknown': [true, { ignoreProperties: ['composes'] }],

                // Требует lowerCamelCase в именах классов CSS Modules
                // https://stylelint.io/user-guide/rules/selector-class-pattern
                'selector-class-pattern': [
                    '^[a-z][a-zA-Z0-9]*$',
                    {
                        message: 'Expected class selector to be lowerCamelCase',
                        severity: 'warning',
                    },
                ],
            },
        },
    ],
} satisfies Config;
