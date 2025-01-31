/* eslint-disable max-lines */
const { rules: baseBestPracticesRules } = require('eslint-config-airbnb-base/rules/best-practices');
const { rules: baseErrorsRules } = require('eslint-config-airbnb-base/rules/errors');
const { rules: baseES6Rules } = require('eslint-config-airbnb-base/rules/es6');

module.exports = {
    parser: '@typescript-eslint/parser',
    extends: ['airbnb', 'airbnb/hooks', 'plugin:@typescript-eslint/recommended', 'prettier'],
    parserOptions: {
        projectService: {
            defaultProject: 'tsconfig.json',
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
    },
    plugins: [
        'react-hooks',
        '@typescript-eslint',
        'import',
        'react',
        'cypress',
        'simple-import-sort',
        'dirnames',
        'unicorn',
        'jsx-a11y',
    ],
    settings: {
        'import/resolver': {
            node: {
                extensions: [
                    '.ts',
                    '.tsx',
                    '.js',
                    '.jsx',
                    '.json',
                    '.d.ts',
                    '.mjs',
                    '.mts',
                    'cjs',
                    'cts',
                ],
            },
        },
        react: {
            version: 'detect',
        },
        // Apply special parsing for TypeScript files
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts', '.mts', '.cts'],
        },
        'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
        // Resolve type definition packages
        'import/external-module-folders': ['node_modules', 'node_modules/@types'],
    },
    rules: {
        quotes: ['warn', 'single', { avoidEscape: true, allowTemplateLiterals: false }],
        'padding-line-between-statements': [
            'warn',
            { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] },
        ],
        'no-shadow': 'off',

        // Override default airbnb rules
        'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
        'no-negated-condition': 'warn',
        'default-case': 'off',
        'no-use-before-define': 'off',
        'prefer-regex-literals': 'off',

        // Code smell detection
        complexity: ['warn', 20],
        'max-params': ['warn', 5],
        'max-lines': ['warn', 300],
        'max-nested-callbacks': 'warn',
        'no-restricted-properties': [
            'error',
            {
                object: 'it',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'describe',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'context',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'test',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
        ],

        // React
        'react/jsx-fragments': ['warn', 'element'],
        'react/static-property-placement': ['error', 'static public field'],
        'react/state-in-constructor': ['error', 'never'],
        'react/prop-types': 'off',
        'react/sort-comp': 'off',
        'react/require-default-props': 'off',
        'react/jsx-boolean-value': ['error', 'always'],
        'react/jsx-props-no-spreading': 'off',
        'react/prefer-stateless-function': 'off',
        'react/destructuring-assignment': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.tsx'] }],
        'react/jsx-one-expression-per-line': 'off',
        'react/function-component-definition': 'off',

        // A11Y
        'jsx-a11y/anchor-is-valid': ['warn', { aspects: ['invalidHref'] }],
        'jsx-a11y/label-has-associated-control': [
            'error',
            { labelComponents: ['label'], assert: 'either' },
        ],

        // typescript
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/array-type': [
            'error',
            { default: 'array-simple', readonly: 'array-simple' },
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-shadow': 'warn',
        'no-unused-vars': 'off',
        'no-new-func': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/no-use-before-define': [
            'error',
            { functions: false, classes: true, variables: true },
        ],
        '@typescript-eslint/default-param-last': 'off',
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                prefer: 'type-imports',
                fixStyle: 'inline-type-imports',
            },
        ],
        '@typescript-eslint/consistent-type-exports': [
            'error',
            {
                fixMixedExportsWithInlineTypeSpecifier: true,
            },
        ],
        'no-return-await': 'off',
        '@typescript-eslint/return-await': [
            baseBestPracticesRules['no-return-await'],
            'in-try-catch',
        ],
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': baseBestPracticesRules['no-redeclare'],

        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': baseBestPracticesRules['no-unused-expressions'],

        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': baseES6Rules['no-useless-constructor'],

        'require-await': 'off',
        '@typescript-eslint/require-await': baseBestPracticesRules['require-await'],

        'no-extra-parens': 'off',
        '@typescript-eslint/no-extra-parens': baseErrorsRules['no-extra-parens'],

        'no-implied-eval': 'off',
        '@typescript-eslint/no-implied-eval': baseBestPracticesRules['no-implied-eval'],

        'no-loss-of-precision': 'off',
        '@typescript-eslint/no-loss-of-precision': baseErrorsRules['no-loss-of-precision'],

        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': baseBestPracticesRules['no-loop-func'],

        'no-magic-numbers': 'off',
        '@typescript-eslint/no-magic-numbers': baseBestPracticesRules['no-magic-numbers'],

        'dot-notation': 'off',
        '@typescript-eslint/dot-notation': baseBestPracticesRules['dot-notation'],

        'no-dupe-class-members': 'off',
        '@typescript-eslint/no-dupe-class-members': baseES6Rules['no-dupe-class-members'],

        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': baseBestPracticesRules['no-empty-function'],

        // Imports, file extensions
        'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: ['**/*.{stories,test,tests,spec}.{js,jsx,ts,tsx}'] },
        ],
        'import/no-cycle': [
            'error',
            {
                ignoreExternal: true,
            },
        ],
        'import/prefer-default-export': 'off',
        'import/no-unresolved': 'off',
        'import/extensions': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        'import/no-useless-path-segments': [
            'error',
            {
                noUselessIndex: true,
            },
        ],
        'dirnames/match-kebab-case': 'error',
        'unicorn/filename-case': [
            'error',
            {
                case: 'kebabCase',
            },
        ],
        'simple-import-sort/imports': [
            'warn',
            {
                groups: [
                    // Node.js builtins. You could also generate this regex if you use a `.js` config.
                    // For example: `^(${require("module").builtinModules.join("|")})(/|$)`
                    [
                        '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
                    ],
                    // Packages. `react` related packages come first.
                    ['^react', '^redux', '^@?\\w'],
                    // Components.
                    ['@alfalab/*', '^arui-(feather|private)(/?.*|$)'],
                    // Root path for project
                    ['^#'],
                    // Parent imports. Put `..` last.
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    // Other relative imports. Put same-folder imports and `.` last.
                    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    // Style imports.
                    ['^.+\\.s?css$'],
                ],
            },
        ],
        'import/no-import-module-exports': 'off',
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'lodash',
                        message:
                            'Import specific parts of "lodash" explicitly, for example: `import isEqual from "lodash/isEqual"`. This will help ensure greater consistency in builds and make it easier to align versions across projects',
                    },
                ],
                patterns: [
                    {
                        group: ['lodash.*'],
                        message:
                            'Import specific parts of "lodash" explicitly, for example: `import isEqual from "lodash/isEqual"`. This will help ensure greater consistency in builds and make it easier to align versions across projects',
                    },
                ],
            },
        ],
        'no-restricted-syntax': [
            'error',
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
        'import/consistent-type-specifier-style': ['error', 'prefer-inline'],
        'import/no-duplicates': ['error', { 'prefer-inline': true, considerQueryString: true }],

        camelcase: 'off',
        // The `@typescript-eslint/naming-convention` rule allows `leadingUnderscore` and `trailingUnderscore` settings. However, the existing `no-underscore-dangle` rule already takes care of this.
        '@typescript-eslint/naming-convention': [
            'error',
            // Allow camelCase variables (23.2), PascalCase variables (23.8), and UPPER_CASE variables (23.10)
            {
                selector: 'variable',
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            },
            // Allow camelCase functions (23.2), and PascalCase functions (23.8)
            {
                selector: 'function',
                format: ['camelCase', 'PascalCase'],
            },
            // Airbnb recommends PascalCase for classes (23.3), and although Airbnb does not make TypeScript recommendations, we are assuming this rule would similarly apply to anything "type like", including interfaces, type aliases, and enums
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
        ],
    },
    overrides: [
        {
            files: ['*.ts', '*.tsx', '*.mts', '*.cts'],
            rules: {
                // The following rules are enabled in Airbnb config, but are already checked (more thoroughly) by the TypeScript compiler
                // Some of the rules also fail in TypeScript files, for example: https://github.com/typescript-eslint/typescript-eslint/issues/662#issuecomment-507081586
                // Rules are inspired by: https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslint-recommended.ts
                'constructor-super': 'off',
                'getter-return': 'off',
                'no-const-assign': 'off',
                'no-dupe-args': 'off',
                'no-dupe-keys': 'off',
                'no-func-assign': 'off',
                'no-import-assign': 'off',
                'no-new-symbol': 'off',
                'no-obj-calls': 'off',
                'no-setter-return': 'off',
                'no-this-before-super': 'off',
                'no-undef': 'off',
                'no-unreachable': 'off',
                'no-unsafe-negation': 'off',
                'valid-typeof': 'off',
                // The following rules are enabled in Airbnb config, but are recommended to be disabled within TypeScript projects
                // See: https://github.com/typescript-eslint/typescript-eslint/blob/13583e65f5973da2a7ae8384493c5e00014db51b/docs/linting/TROUBLESHOOTING.md#eslint-plugin-import
                'import/named': 'off',
                'import/no-named-as-default-member': 'off',
            },
        },
        {
            files: ['*.{test,tests,spec}.{js,jsx,ts,tsx,cjs,cts,mjs,mts}'],
            env: {
                node: true,
                jest: true,
                browser: true,
            },
        },
        {
            files: ['**/cypress/**/*'],
            env: {
                'cypress/globals': true,
            },
            rules: {
                'cypress/no-assigning-return-values': 'error',
                'cypress/no-unnecessary-waiting': 'error',
            },
        },
    ],
};
