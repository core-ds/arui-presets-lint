# Общая конфигурация линтеров

[![npm][npm-img]][npm]
[![license][license-img]][license]

[license]: https://opensource.org/licenses/MIT
[license-img]: https://img.shields.io/badge/License-MIT-brightgreen.svg
[npm-img]: https://img.shields.io/npm/v/arui-presets-lint.svg
[npm]: https://www.npmjs.org/package/arui-presets-lint

<br />

Набор конфигурационных файлов для валидации react/node/typescript-проектов.

[Как я могу внести изменения?](./CONTRIBUTING.md)

🚀 [Миграция на версию 9](./V9_MIGRATION_GUIDE.md)

## Установка и обновление

Установить библиотеку в проект нужно как dev dependency:

```sh
    yarn add -D arui-presets-lint
```

> ⚠️ С версии 8.0.0 библиотеке более не требуется установка peer dependency

Далее произвести следующие настройки:

## Подключение конфигов prettier/stylelint/commitlint через `package.json`:

```json
{
    "prettier": "arui-presets-lint/prettier",
    "stylelint": { "extends": "arui-presets-lint/stylelint" },
    "commitlint": { "extends": "arui-presets-lint/commitlint" }
}
```

Для настройки eslint нужно создать в корне проекта файл `eslint.config.mts` со следующим содержанием:

```typescript
import { defineConfig } from 'arui-presets-lint/eslint/config';
import { eslintConfig } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig);
```

Если нужно расширить конфиг eslint на уровне проекта, дополнить его какими-то плагинами, можно это сделать подобным способом:

```typescript
import pluginCypress from 'eslint-plugin-cypress';
import { defineConfig } from 'arui-presets-lint/eslint/config';
import { eslintConfig } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig, [
    {
        rules: {
            'no-console': 'off',
            'max-lines': 'off',
        },
    },
    pluginCypress.configs.recommended,
    {
        rules: {
            'cypress/no-unnecessary-waiting': 'off',
        },
    },
]);
```

Если в проекте есть файлы typescript, которые не добавлены в `tsconfig.json`, или исключены из него принудительно, то eslint выдаст ошибку `<filename> was not found by the project service. Consider either including it in the tsconfig.json or including it in allowDefaultProject`. Есть несколько способов решения этой проблемы:

- (Рекомендуется) Добавить нужные файлы через опцию allowDefaultProject:

```typescript
import { eslintConfig } from 'arui-presets-lint/eslint';
import { defineConfig } from 'arui-presets-lint/eslint/config';

export default defineConfig(eslintConfig, [
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // Это позволит eslint линтить файлы, даже если они не указаны в tsconfig.json
                    // Обратите внимание, что включить '**' тут нельзя, влияет на производительность!
                    // https://typescript-eslint.io/packages/parser/#allowdefaultproject
                    // Конретно тут - разрешаем линтить все файлы с расширениями .ts, .mts и .cts в корневой директории проекта
                    allowDefaultProject: ['*.ts', '*.mts', '*.cts'],
                },
            },
        },
        files: ['**/*.{ts,tsx,mts,cts,mtsx,ctsx}'],
    },
]);
```

- (НЕ рекомендуется) Добавить файлы в globalIgnores. В этом случае eslint не будет его проверять:

```typescript
import { eslintConfig } from 'arui-presets-lint/eslint';
import { defineConfig } from 'arui-presets-lint/eslint/config';

export default defineConfig(eslintConfig, [
    {
        globalIgnores(['eslint.config.mts', 'arui-scripts.config.ts', 'playwright.config.ts']),
    },
]);
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
        "lint:fix": "yarn lint:styles --fix && yarn lint:scripts --fix && yarn format"
    }
}
```

Чтобы eslint / stylelint / prettier не проверял конкретные файлы и папки, можно исключить их с помощью файлов .stylelintignore / .prettierignore / .eslintignore Прописывать там файлы, которые уже есть в .gitignore не требуется!

> Вместо файла .eslintignore рекомендуется использовать globalIgnores в конфиге eslint ([подробнее](https://eslint.org/docs/latest/use/configure/ignore)). Импортируем функцию globalIgnores из `arui-presets-lint` вот так:

```typescript
import { defineConfig, globalIgnores } from 'arui-presets-lint/eslint/config';
...
```

> Для запуска eslint/stylelint рекомендуется использовать флаг [--max-warnings](https://eslint.org/docs/latest/user-guide/command-line-interface#--max-warnings), который позволяет ограничить количество возникающих предупреждений.

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

## Настройка [lefthook](https://github.com/evilmartians/lefthook)

При установке библиотеки в корне проекта создался файл lefthook.yml,
он должен содержать следующее:

```yaml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
```

Этот конфиг можно расширить специфичными для вашего проекта настройками, см. [документацию](https://lefthook.dev/configuration/) Примеры такого расширения:

```yml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml

pre-commit:
    commands:
        # Добавить сборку typescript на pre-commit:
        check-ts:
            run: npx --no-install tsc --noEmit

        # Запустить тесты, относящиеся к измененному файлу:
        run-tests:
            glob: '*.{js,ts,jsx,tsx,mts,mjs,cjs,cts}'
            run: npx --no-install jest --findRelatedTests --passWithNoTests {staged_files}

pre-push:
    commands:
        # Запустить команду 'lint' на pre-push:
        run-lint:
            run: yarn lint
```

## Гибкая конфигурация

Так как `yarn run` в yarn 2+ не поддерживает возможность запускать бинарные файлы, которые не установлены как прямые зависимости, а `yarn dlx` не умеет запускать бинарники без скачивания его из npm, существует возможность это сделать через вызов `npx --no-install ...`:

```sh
# Применить конфигурацию lefthook:
npx --no-install lefthook install

# Вызов prettier, для того чтобы отформатировать только js и jsx файлы:
npx --no-install prettier --write "./**/*.{js,jsx}" --no-error-on-unmatched-pattern --cache

# Вызов eslint, для того чтобы проверить только js и jsx файлы:
npx --no-install eslint "**/*.{js,jsx}"
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

# eslint в удобном ui-инспекторе:
npx @eslint/config-inspector@latest

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

## Лицензия

```
The MIT License (MIT)

Copyright (c) 2026 core-ds contributors

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
