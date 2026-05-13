---
'arui-presets-lint': minor
---

## New Features

    - Подключены плагины [`@eslint/json`](https://github.com/eslint/json) и [`@eslint/markdown`](https://github.com/eslint/markdown).
    - `.json` файлы проверяются как строгий JSON, `.jsonc` и `tsconfig*.json` - как JSONC, `.json5` — как JSON5. Правила: `json/no-duplicate-keys`, `json/no-empty-keys`, `json/no-unnormalized-keys`, `json/no-unsafe-values` (как error).
    - `.md` файлы проверяются по CommonMark (как warning). Подключены все рекомендованные правила `@eslint/markdown` (контроль уровней заголовков, отсутствие пустых ссылок/изображений, alt-текст и т.д.). `**/CHANGELOG.md` игнорируется по умолчанию.
    - Добавлены константы для удобного прописывания области видимости правил на уровне проекта

## Bug fixes

    - Исправлены скоупы files, все плагины определены глобально, для того чтобы корректно срабатывало переопределение.
