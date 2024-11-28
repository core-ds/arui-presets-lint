# Гид по миграции на arui-presets-lint@8

## Введение

Обновление содержит в себе множество изменений, которые позволяют работать с конфигурацией линтеров в проектах проще. Ключевые изменения:

-   Поставляется готовая конфигурация lefthook - инструмента, который заменяет lint-staged и husky
-   Больше никаких peer dependency - работа с ними вызывала боль, инструменты по их автоматической установке не работают в yarn 4. Никто больше не сможет сломать вашу конфигурацию случайным поднятием зависимости
-   CLI для запуска команд позволяет не писать копипасту в каждом проекте
-   Новые решения гибкие - возможность писать собственные команды остается, как и возможность расширить конфигурацию lefthook (см [README](./README.md))

1. Для начала нужно выполнить команду:

```bash
yarn remove eslint eslint-config-airbnb eslint-config-airbnb-typescript eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-cypress eslint-plugin-dirnames eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-unicorn lint-staged prettier stylelint @typescript-eslint/parser @typescript-eslint/eslint-plugin stylelint-config-prettier husky kebab-case @commitlint/cli @commitlint/config-conventional
```

-- отмечу, что никаких зависимостей с плагинами stylelint/eslint в проекте быть не должно, кроме тех, которые использует ваш локальный конфиг

2. Удалить конфигурации husky и lint-staged (могут находится в .husky, .huskyrc.js, package.json.husky, .lintstagedrc.js, package.json.lint-staged, итп). Для husky 5+ нужно также удалить настройку `hooksPath = .husky` из `git/config`.

3. Добавить в lefthook.yml следующее:

```yml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
```

В этот файл нужно дописать конфигурацию, которая присутствует в ваших текущих lint-staged/husky настройках, но отсутствует в `arui-presets-lint/lefthook/index.yml` см. [документацию](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md) Например:

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

4. Выполнить следующую команду:

```
npx --no-install lefthook install
```

чтобы установить новую конфигурацию git-hooks. Отмечу, что в библиотеке lefthook есть скрипт, который делает это автоматически при каждой установке библиотеки arui-presets-lint.

5. Поменять команды для запуска в package.json.scripts, они должны выглядить следующим образом:

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

6. Выполнить команду `yarn lint:fix`, и исправить возникающие ошибки

## Возможные проблемы и способы их решения:

> Q: Получаю ошибку `node_modules/.bin/prettier: Permission denied`

> A: Это плавающая проблема с установкой библиотеки prettier, которая решается командой: `chmod +x ./node_modules/.bin/prettier`
> Происходит такое только на системах macOS [issue](https://github.com/prettier/prettier/issues/15164)

> Q: Отображается warning при изменении файла, который не должен проверятся eslint:
> `0:0  warning  File ignored because of a matching ignore pattern. Use "--no-ignore" to disable file ignore settings or use "--no-warn-ignored" to suppress this warning.`

> A: Это ожидаемое поведение, eslint не будет пытаться изменить файл. Warning будет отключен в рамках [issue](https://github.com/core-ds/arui-presets-lint/issues/28), следите за обновлениями
