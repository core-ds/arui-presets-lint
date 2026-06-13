import { type KnipConfig } from 'knip';

export default {
    // не репортить экспорты, которые используются только внутри своего же файла
    ignoreExportsUsedInFile: true,
    // плагин ломается на self-reference `commitlint.extends: "./commitlint/index.ts"`
    // в package.json (резолвит путь как имя shareable-конфига); его deps учтены ниже
    commitlint: false,
    // зависимости, которые используются как строковые ссылки в конфигах
    // (плагины stylelint, extends commitlint, пресет secretlint) или запускаются
    // как бинарники (через cli/execa и git-хуки lefthook) — статически knip их не видит
    ignoreDependencies: [
        '@alfalab/stylelint-core-vars',
        '@alfalab/core-components-vars',
        'stylelint-order',
        '@commitlint/config-conventional',
        '@commitlint/cli',
        '@secretlint/secretlint-rule-preset-recommend',
        'secretlint',
        'lefthook',
        '@alfalab/core-components',
    ],
    workspaces: {
        '.': {
            entry: ['eslint.config.mts'],
        },
        'packages/arui-presets-lint': {
            // _internal-скрипты запускаются через tsx, тестовые фикстуры — входные данные линтеров
            entry: ['_internal/*.ts', 'test/*-input.{ts,tsx,js,jsx}'],
        },
        'packages/stylelint-core-vars': {
            entry: ['eslint.config.mts', 'scripts/*.ts'],
        },
    },
} satisfies KnipConfig;
