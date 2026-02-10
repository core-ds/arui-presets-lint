export default {
    rules: {
        'block-no-empty': true,
        'color-hex-length': 'short',
        'color-no-invalid-hex': true,
        'comment-empty-line-before': [
            'always',
            {
                except: ['first-nested'],
                ignore: ['stylelint-commands'],
            },
        ],
        'comment-no-empty': true,
        'comment-whitespace-inside': 'always',
        'custom-property-empty-line-before': [
            'always',
            {
                except: ['after-custom-property', 'first-nested'],
                ignore: ['after-comment', 'inside-single-line-block'],
            },
        ],
        'declaration-block-no-shorthand-property-overrides': true,
        'declaration-block-single-line-max-declarations': 2,
        'function-calc-no-unspaced-operator': true,
        'function-linear-gradient-no-nonstandard-direction': true,
        'function-name-case': 'lower',
        'keyframe-declaration-no-important': true,
        'length-zero-no-unit': true,
        'no-empty-source': true,
        'no-invalid-double-slash-comments': true,
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
        'selector-pseudo-element-colon-notation': 'single',
        'selector-pseudo-element-no-unknown': true,
        'selector-type-case': 'lower',
        'selector-type-no-unknown': true,
        'shorthand-property-no-redundant-values': true,
        'string-no-newline': true,
        'unit-no-unknown': true,
        'no-duplicate-selectors': true,
        'declaration-block-no-duplicate-properties': [
            true,
            {
                ignore: ['consecutive-duplicates-with-different-syntaxes'],
            },
        ],

        'stylelint-core-vars/use-vars': true,
        'stylelint-core-vars/use-mixins': true,
        'stylelint-core-vars/use-one-of-vars': [true, { severity: 'warning' }],
        'stylelint-core-vars/use-one-of-mixins': [true, { severity: 'warning' }],
        'stylelint-core-vars/do-not-use-dark-colors': [true, { severity: 'warning' }],
        'block-opening-brace-newline-after': 'always',
        'block-opening-brace-newline-before': 'always',
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
                'selector-class-pattern': [
                    // Запрещаем использовать дефис '-'
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
