# Общая конфигурация линтеров

[![npm][npm-img]][npm]
[![license][license-img]][license]

[license]: https://opensource.org/licenses/MIT
[license-img]: https://img.shields.io/badge/License-MIT-brightgreen.svg
[npm-img]: https://img.shields.io/npm/v/arui-presets-lint.svg
[npm]: https://www.npmjs.org/package/arui-presets-lint

<br />

Набор общих конфигурационных файлов для валидации react/node/typescript-проектов.

[Как я могу улучшить стандарты?](./.github/CONTRIBUTING.md)

## Установка и обновление

Установить библиотеку в проект нужно как dev dependency:

```bash
    yarn add -D arui-presets-lint
```

> ⚠️ С версии 8.0.0 библиотеке более не требуется установка peer dependency [подробнее](./V8_MIGRATION_GUIDE.md)

Далее произвести следующие настройки:

## Подключение конфигов через `package.json`:

```json
{
    "prettier": "arui-presets-lint/prettier",
    "eslintConfig": {
        "extends": "./node_modules/arui-presets-lint/eslint"
    },
    "stylelint": {
        "extends": "arui-presets-lint/stylelint"
    },
    "commitlint": {
        "extends": "./node_modules/arui-presets-lint/commitlint"
    }
}
```

## Конфигурация скриптов для запуска в `package.json`:

```json
{
    "scripts": {
        "lint:css": "arui-presets-lint css",
        "lint:scripts": "arui-presets-lint scripts",
        "lint": "arui-presets-lint lint",
        "lint:fix": "arui-presets-lint fix",
    }
}
```

## Конфигурация [lefthook](https://github.com/evilmartians/lefthook)

При установке библиотеки в корне проекта создался файл lefthook.yml,
он должен содержать следующее:

```yaml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
```

Чтобы eslint / stylelint / prettier не проверял файлы, которые не находятся в .gitignore, вы можете исключить
их с помощью .eslintignore / .stylelintignore / prettierignore. Прописывать там файлы, которые уже есть в .gitignore не требуется!

Для запуска eslint/stylelint рекомендуется использовать флаг [--max-warnings](https://eslint.org/docs/latest/user-guide/command-line-interface#--max-warnings), который позволяет ограничить количество возникающих предупреждений.

Пример такой конфигурации:
```json
{
    "scripts": {
        "lint:css": "arui-presets-lint css --max-warnings=0",
        "lint:scripts": "arui-presets-lint scripts --max-warnings=0",
    }
}
```

## CLI

Так как yarn berry не поддерживает возможность запускать бинарные файлы, которые не установлены как прямые зависимости, существует возможность это сделать через CLI библиотеки, например:

```sh
yarn arui-presets-lint run lefthook install

yarn arui-presets-lint run prettier --write
```

- что примерно равно поведению при запуске бинарника через команду `npx --no-install ...`
Таким образом можно гибко настраивать поведение линтеров для вашего проекта, если по какой-то причине стандартная конфигурация вам не подходит.

## Настройка IDE:

1. Включить ESLint
    - [Расширение для VS Code](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
    - [Инструкция для Webstorm](https://www.jetbrains.com/help/webstorm/eslint.html#ws_js_eslint_activate)
2. Включить Stylelint
    - [Расширение для VS Code](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
    - [Инструкция для Webstorm](https://www.jetbrains.com/help/webstorm/using-stylelint-code-quality-tool.html#ws_stylelint_configure)
3. Включить Prettier
    - [Расширение для VS Code](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
    - [Инструкция для Webstorm](https://prettier.io/docs/en/webstorm.html)

## Релизы

Данный проект использует [semantic-release](https://semantic-release.gitbook.io/semantic-release/).

Выпуск новой версии происходит с помощью Github Actions, используйте джобу `Create new library package`. Для beta-версии используется ветка `beta`, для релизной - `master`.

## Лицензия

```
The MIT License (MIT)

Copyright (c) 2024 core-ds contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
