# Гид по миграции на arui-presets-lint@8

## Введение
Обновление содержит в себе множество изменений, которые позволяют работать с конфигурацией линтеров в проектах проще. Ключевые изменения:
- Поставляется готовая конфигурация lefthook - инструмента, который заменяет lint-staged и husky
- Больше никаких peer dependency - работа с ними вызывала боль, инструменты по их автоматической установке не работают в yarn 4. Никто больше не сможет сломать вашу конфигурацию случайным поднятием зависимости
- CLI для запуска команд позволяет не писать копипасту в каждом проекте
- Новые решения гибкие - возможность писать собственные команды остается, как и возможность расширить конфигурацию lefthook (см [README](./README.md))

1. Для начала нужно выполнить команду:

```bash
yarn remove eslint eslint-config-airbnb eslint-config-airbnb-typescript eslint-config-prettier eslint-import-resolver-typescript eslint-plugin-cypress eslint-plugin-dirnames eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-unicorn lint-staged prettier stylelint @typescript-eslint/parser @typescript-eslint/eslint-plugin stylelint-config-prettier husky kebab-case
```
-- отмечу, что никаких зависимостей с плагинами stylelint/eslint в проекте быть не должно, кроме тех, которые использует ваш локальный конфиг

2. Добавить в конец .gitignore строчки:
```
    .eslintcache
    .stylelintcache
```

3. Удалить конфигурации husky и lint-staged (могут находится в .husky, .huskyrc.js, package.json.husky, .lintstagedrc.js, package.json.lint-staged, итп)

4. Добавить в lefthook.yml следующее:
```yaml
extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
```
[документация](https://github.com/evilmartians/lefthook/blob/master/docs/configuration.md)

5. Выполнить следующую команду:
```
yarn arui-presets-lint run lefthook install
```
чтобы установить новую конфигурацию githook. Отмечу, что в библиотеке lefthook есть postinstall скрипт, который это делает автоматически.

6. Поменять команды для запуска в package.json.scripts, они должны выглядить следующим образом:

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
Команда 'format', если она использовась ранее, больше не нужна - ```lint:fix``` запускает по очереди stylelint, eslint и prettier в режиме автофикса

7. Выполнить команду ```yarn lint:fix```, и исправить возникающие ошибки

## Возможные проблемы и способы их решения:

> Q: Получаю ошибку `node_modules/.bin/prettier: Permission denied`

> A: Это плавающая проблема с установкой библиотеки prettier, которая решается командой: `chmod +x ./node_modules/.bin/prettier`
Происходит такое только на системах macOS [issue](https://github.com/prettier/prettier/issues/15164)
