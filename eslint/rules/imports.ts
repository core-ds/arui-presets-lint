import { type TSESLint } from '@typescript-eslint/utils';
import checkFilePlugin from 'eslint-plugin-check-file';
import { importX } from 'eslint-plugin-import-x';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';

export const importsConfig: TSESLint.FlatConfig.Config = {
    // https://github.com/un-ts/eslint-plugin-import-x/blob/master/src/config/flat/typescript.ts
    ...importX.flatConfigs.typescript,
    name: 'arui-presets-lint/imports',
    plugins: {
        'import-x': importX,
        'simple-import-sort': simpleImportSortPlugin,
        'check-file': checkFilePlugin,
    },
    settings: {
        ...importX.flatConfigs.typescript.settings,
        // https://github.com/un-ts/eslint-plugin-import-x?tab=readme-ov-file#settings
        'import-x/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts', '.mts', '.cts', '.mtsx'],
        },
        'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
        'import-x/resolver': {
            typescript: true,
            node: {
                extensions: [
                    '.ts',
                    '.tsx',
                    '.mtsx',
                    '.js',
                    '.jsx',
                    '.mjsx',
                    '.json',
                    '.d.ts',
                    '.mjs',
                    '.mts',
                    '.cjs',
                    '.cts',
                ],
            },
        },
        'import-x/core-modules': [],
        'import-x/ignore': ['node_modules', String.raw`\.(coffee|scss|css|less|hbs|svg|json)$`],
    },
    rules: {
        ...importX.flatConfigs.typescript.rules,
        // гарантировать соответствие именованных импортов именованным экспортам
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/named.md
        'import-x/named': 'error',

        // гарантировать соответствие импорта по умолчанию экспорту по умолчанию
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/default.md
        'import-x/default': 'off',

        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/namespace.md
        'import-x/namespace': 'off',

        // запрещать недопустимые экспорты, например несколько экспортов по умолчанию
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/export.md
        'import-x/export': 'error',

        // запрещать совпадение имени импорта по умолчанию с именованным экспортом
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-as-default.md
        'import-x/no-named-as-default': 'error',

        // предупреждать при обращении к свойствам экспорта по умолчанию, которые также являются именованными экспортами
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-as-default-member.md
        'import-x/no-named-as-default-member': 'warn',

        // запрещать использование импортов, помеченных в JSDoc как устаревшие
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-deprecated.md
        'import-x/no-deprecated': 'off',

        // Запрещать использование посторонних пакетов
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-extraneous-dependencies.md
        // пути рассматриваются как абсолютные и относительные к домашней папке проекта
        'import-x/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    // В тестах - разрешаем импорт из devDependencies
                    '**/*.{stories,test,tests,spec}.{js,jsx,ts,tsx,mts,cts,mtsx,ctsx,mjsx,cjsx}',
                    // Для всех файлов на первом уровен вложенности проекта - разрешаем импорт из devDependencies
                    '*.*',
                ],
            },
        ],

        // Запрещать изменяемые экспорты
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-mutable-exports.md
        'import-x/no-mutable-exports': 'error',

        // запрещать require()
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-commonjs.md
        'import-x/no-commonjs': 'off',

        // запрещать AMD require/define
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-amd.md
        'import-x/no-amd': 'error',

        // запрещать размещение операторов, не являющихся import, перед операторами import
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/first.md
        'import-x/first': 'error',

        // запрещать дублирующиеся импорты
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-duplicates.md
        'import-x/no-duplicates': ['error', { 'prefer-inline': true, considerQueryString: true }],

        // Обеспечивать единообразное использование расширений файлов в пути импорта
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/extensions.md
        'import-x/extensions': 'off',

        // Требовать пустую строку после последнего import/require в группе
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/newline-after-import.md
        'import-x/newline-after-import': 'error',

        // Требовать, чтобы модули с единственным экспортом использовали экспорт по умолчанию
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/prefer-default-export.md
        'import-x/prefer-default-export': 'off',

        // Ограничивать, какие файлы можно импортировать в заданной папке
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-restricted-paths.md
        'import-x/no-restricted-paths': 'off',

        // Запрещать слишком большое количество зависимостей у модулей
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/max-dependencies.md
        'import-x/max-dependencies': ['off', { max: 10 }],

        // Запрещать импорт модулей с использованием абсолютных путей
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-absolute-path.md
        'import-x/no-absolute-path': 'error',

        // Запрещать вызовы require() с выражениями
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-dynamic-require.md
        'import-x/no-dynamic-require': 'error',

        // предотвращать импорт вложенных модулей других модулей
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-internal-modules.md
        'import-x/no-internal-modules': [
            'off',
            {
                allow: [],
            },
        ],

        // Предупреждать, если модуль может быть ошибочно разобран потребителем как скрипт
        // использующим Unambiguous JavaScript Grammar
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/unambiguous.md
        // не следует включать до тех пор, пока это предложение хотя бы не будет представлено TC39.
        // На данный момент это не реализовано.
        'import-x/unambiguous': 'off',

        // Запрещать синтаксис загрузчиков Webpack в импортируемых путях
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-webpack-loader-syntax.md
        'import-x/no-webpack-loader-syntax': 'error',

        // Предотвращать не присвоенные импорты
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-unassigned-import.md
        // импорт ради побочных эффектов вполне допустим, если они нужны.
        'import-x/no-unassigned-import': 'off',

        // Предотвращать импорт значения по умолчанию как будто оно именованное
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-default.md
        'import-x/no-named-default': 'error',

        // Сообщать, если экспорт по умолчанию у модуля безымянный
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-anonymous-default-export.md
        'import-x/no-anonymous-default-export': [
            'off',
            {
                allowArray: false,
                allowArrowFunction: false,
                allowAnonymousClass: false,
                allowAnonymousFunction: false,
                allowLiteral: false,
                allowObject: false,
            },
        ],

        // Сообщать, когда именованные экспорты не сгруппированы в одной декларации экспорта
        // или когда присутствуют множественные присваивания CommonJS module.exports или объекта exports
        // в одном файле.
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/group-exports.md
        'import-x/group-exports': 'off',

        // запрещать экспорты по умолчанию. это ужасное правило, не используйте его.
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-default-export.md
        'import-x/no-default-export': 'off',

        // запрещать именованные экспорты. это ужасное правило, не используйте его.
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-named-export.md
        'import-x/no-named-export': 'off',

        // Запрещать модулю импортировать сам себя
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-self-import.md
        'import-x/no-self-import': 'error',

        // Запрещать циклические зависимости между модулями
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-cycle.md
        'import-x/no-cycle': ['error', { ignoreExternal: true }],

        // Гарантировать отсутствие бесполезных сегментов пути
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-useless-path-segments.md
        'import-x/no-useless-path-segments': ['error', { noUselessIndex: true }],

        // для динамических импортов требуется начальный комментарий с webpackChunkName
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/dynamic-import-chunkname.md
        'import-x/dynamic-import-chunkname': [
            'off',
            {
                importFunctions: [],
                webpackChunknameFormat: '[0-9a-zA-Z-_/.]+',
            },
        ],

        // Используйте это правило, чтобы предотвратить импорты в каталоги на относительных родительских путях.
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-relative-parent-imports.md
        'import-x/no-relative-parent-imports': 'off',

        // Используйте это правило, чтобы предотвратить импорт пакетов через относительные пути.
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-relative-packages.md
        'import-x/no-relative-packages': 'error',

        // Обеспечивает единообразный стиль написания импорта типов в typescript
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/consistent-type-specifier-style.md
        'import-x/consistent-type-specifier-style': ['error', 'prefer-inline'],

        // Запрет смешивания CommonJS и ESM в одном файле
        // https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-import-module-exports.md
        'import-x/no-import-module-exports': 'off',

        // Правила сортировки импортов
        // https://github.com/lydell/eslint-plugin-simple-import-sort/blob/main/README.md
        'simple-import-sort/imports': [
            'warn',
            {
                groups: [
                    [
                        '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
                    ],
                    ['^react', '^redux', String.raw`^@?\w`],
                    ['@alfalab/*', '^arui-(feather|private)(/?.*|$)'],
                    ['^#'],
                    [String.raw`^\.\.(?!/?$)`, String.raw`^\.\./?$`],
                    [String.raw`^\./(?=.*/)(?!/?$)`, String.raw`^\.(?!/?$)`, String.raw`^\./?$`],
                    [String.raw`^.+\.s?css$`],
                ],
            },
        ],

        // Список запрещенных импортов
        // https://eslint.org/docs/latest/rules/no-restricted-imports
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

        // Запрещает указанные имена при экспорте
        // https://eslint.org/docs/rules/no-restricted-exports
        'no-restricted-exports': [
            'error',
            {
                restrictedNamedExports: [
                    'default', // use `export default` to provide a default export
                    'then', // this will cause tons of confusion when your module is dynamically `import()`ed, and will break in most node ESM versions
                ],
            },
        ],

        // Запрещает импорт с одного и того же пути более одного раза
        // https://eslint.org/docs/rules/no-duplicate-imports
        // Заменено правилом https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-duplicates.md
        'no-duplicate-imports': 'off',

        // Сортировка импортов
        // https://eslint.org/docs/rules/sort-imports
        'sort-imports': 'off',

        // Все названия файлов должны быть в kebab-case
        // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-naming-convention.md
        'check-file/folder-naming-convention': [
            'error',
            { '**/*.*': 'KEBAB_CASE' },
            { ignoreMiddleExtensions: true },
        ],

        // Все названия папок должны быть в kebab-case
        // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/folder-naming-convention.md
        'check-file/filename-naming-convention': [
            'error',
            { '**/*.*': 'KEBAB_CASE' },
            { ignoreMiddleExtensions: true },
        ],

        // Список запрещенных названий файлов
        // https://github.com/dukeluo/eslint-plugin-check-file/blob/main/docs/rules/filename-blocklist.md
        'check-file/filename-blocklist': [
            'error',
            { '**/tsconfig.eslint.json': '*tsconfig.json' },
            {
                errorMessage:
                    'Вместо tsconfig.eslint.json используйте languageOptions.parserOptions.projectService.allowDefaultProject в конфиге eslint',
            },
        ],
    },
};
