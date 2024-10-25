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

```sh
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
        "lint:styles": "arui-presets-lint styles",
        "lint:scripts": "arui-presets-lint scripts",
        "format": "arui-presets-lint format",
        "format:check": "arui-presets-lint format:check",
        "lint": "yarn lint:styles && yarn lint:scripts && yarn format:check",
        "lint:fix": "yarn lint:styles --fix && yarn lint:scripts && yarn format"
    }
}
```

## Настройка [lefthook](https://github.com/evilmartians/lefthook)

При установке библиотеки в корне проекта создался файл lefthook.yml,
он должен содержать следующее:

```yaml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
```

Этот конфиг можно расширить специфичными для вашего проекта настройками, см. [документацию](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md)

Чтобы eslint / stylelint / prettier не проверял конкретные файлы и папки, можно исключить их с помощью файлов .eslintignore / .stylelintignore / .prettierignore. Прописывать там файлы, которые уже есть в .gitignore не требуется!

Для запуска eslint/stylelint рекомендуется использовать флаг [--max-warnings](https://eslint.org/docs/latest/user-guide/command-line-interface#--max-warnings), который позволяет ограничить количество возникающих предупреждений.

Пример такой конфигурации:
```json
{
    "scripts": {
        "lint:styles": "arui-presets-lint styles --max-warnings=0",
        "lint:scripts": "arui-presets-lint scripts --max-warnings=0",
        ...
    }
}
```

## Гибкая конфигурация

Так как `yarn run` в yarn 2+ не поддерживает возможность запускать бинарные файлы, которые не установлены как прямые зависимости, а `yarn dlx` не умеет запускать бинарники без скачивания его из npm, существует возможность это сделать через вызов `npx --no-install ...`:

```sh
# Применить конфигурацию lefthook:
npx --no-install lefthook install

# Вызов prettier, для того чтобы отформатировать только js и jsx файлы:
npx --no-install prettier --write "./**/*.{js,jsx}" --no-error-on-unmatched-pattern --cache

# Вызов eslint, для того чтобы проверить только js и jsx файлы:
npx --no-install eslint "**/*.{js,jsx}" --ext .js,.jsx --ignore-pattern=.gitignore,.eslintignore --cache --cache-location="./node_modules/.cache/eslint/.eslintcache"
```

Таким образом можно гибко настраивать поведение линтеров для вашего проекта, если по какой-то причине стандартная конфигурация вам не подходит.

## Дебаг
Если нужно увидеть в консоли чему именно соответствует алиас в cli-утилите, нужно запустить arui-presets-lint с флагом --echo, например:
```sh
yarn arui-presets-lint --echo format
# >> prettier --write "./**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json}" --no-error-on-unmatched-pattern --cache
```

Если нужно посмотреть, какой именно конфиг применяется в текущем проекте:
```sh
# eslint:
npx --no-install eslint --print-config file.tsx > eslintconfig.json

# stylelint:
npx --no-install stylelint --print-config file.css > stylelintconfig.json

# commitlint:
npx --no-install commitlint --print-config > commitlintconfig.txt
```


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
