export default {
    rules: {
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

        // Требует пробелы вокруг операторов в calc()
        // https://stylelint.io/user-guide/rules/function-calc-no-unspaced-operator
        'function-calc-no-unspaced-operator': true,

        // Запрещает нестандартные направления в linear-gradient()
        // https://stylelint.io/user-guide/rules/function-linear-gradient-no-nonstandard-direction
        'function-linear-gradient-no-nonstandard-direction': true,

        // Требует нижний регистр для имeн функций
        // https://stylelint.io/user-guide/rules/function-name-case
        'function-name-case': 'lower',

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

        // Запрещает дублирующиеся селекторы
        // https://stylelint.io/user-guide/rules/no-duplicate-selectors
        'no-duplicate-selectors': true,

        // Запрещает дублирующиеся свойства в блоке
        // https://stylelint.io/user-guide/rules/declaration-block-no-duplicate-properties
        'declaration-block-no-duplicate-properties': [
            true,
            {
                ignore: ['consecutive-duplicates-with-different-syntaxes'],
            },
        ],

        // Требует использовать CSS-переменные дизайн-системы вместо хардкода
        // https://github.com/core-ds/stylelint-core-vars
        'stylelint-core-vars/use-vars': true,

        // Требует использовать миксины дизайн-системы
        // https://github.com/core-ds/stylelint-core-vars
        'stylelint-core-vars/use-mixins': true,

        // Рекомендует использовать один из доступных vars при выборе значения
        // https://github.com/core-ds/stylelint-core-vars
        'stylelint-core-vars/use-one-of-vars': [true, { severity: 'warning' }],

        // Рекомендует использовать один из доступных mixins при выборе
        // https://github.com/core-ds/stylelint-core-vars
        'stylelint-core-vars/use-one-of-mixins': [true, { severity: 'warning' }],

        // Предупреждает об использовании тeмных цветов напрямую
        // https://github.com/core-ds/stylelint-core-vars
        'stylelint-core-vars/do-not-use-dark-colors': [true, { severity: 'warning' }],

        // Требует перевод строки после открывающей фигурной скобки
        // https://stylelint.io/user-guide/rules/block-opening-brace-newline-after
        'block-opening-brace-newline-after': 'always',

        // Требует перевод строки перед открывающей фигурной скобкой
        // https://stylelint.io/user-guide/rules/block-opening-brace-newline-before
        'block-opening-brace-newline-before': 'always',

        // Требует пустую строку перед правилами
        // https://stylelint.io/user-guide/rules/rule-empty-line-before
        'rule-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['after-comment'],
            },
        ],
    },
    plugins: ['@alfalab/stylelint-core-vars'],
    overrides: [
        {
            files: ['*.module.css'],
            rules: {
                // Запрещает дефис в классах (требует camelCase или snake_case)
                // https://stylelint.io/user-guide/rules/selector-class-pattern
                'selector-class-pattern': [
                    '^[^-]+$',
                    {
                        resolveNestedSelectors: true,
                        message:
                            'Expected class selector to be camelCase (or, for corner cases, snake_case)',
                        severity: 'warning',
                    },
                ],
            },
        },
    ],
};
