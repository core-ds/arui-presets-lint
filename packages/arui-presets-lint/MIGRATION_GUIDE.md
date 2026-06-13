# Гид по миграции на arui-presets-lint@11 с 9/10

[Обновляетесь с 8 на 9/10?](https://github.com/core-ds/arui-presets-lint/blob/v10.2.0/MIGRATION_GUIDE.md)

## Введение

Основные поинты - это 2 новых линтера (secretlint и knip) и дефолтный конфиг для хука pre-push в lefthook.

1. Обновить зависимость:

```bash
yarn add arui-presets-lint@latest
```|

и после этого запустить:
```bash
npx --no-install lefthook install
```

1. Проверить содержимое ключа `pre-push` в вашем lefthook.yml - arui-presets-lint начал поставлять дефолтную конфигурацию для него, не должно ничего дублироваться

1. Добавить конфиги knip и secretlint в корень проекта:

> knip.ts
```typescript
export { default } from 'arui-presets-lint/knip';
```

> .secretlintrc.json
```json
{
    "rules": [
        {
            "id": "@secretlint/secretlint-rule-preset-recommend"
        }
    ]
}
```


```json
{
    "scripts": {
        "lint:styles": "arui-presets-lint styles",
        "lint:scripts": "arui-presets-lint scripts",
        "format": "arui-presets-lint format",
        "format:check": "arui-presets-lint format:check",
        "lint": "yarn lint:styles && yarn lint:scripts && yarn format:check && yarn lint:unused && yarn lint:secrets",
        "lint:fix": "yarn lint:styles --fix && yarn lint:scripts --fix && yarn format && yarn lint:unused --fix --allow-remove-files && yarn lint:secrets",
        "lint:unused": "arui-presets-lint knip",
        "lint:secrets": "arui-presets-lint secretlint"
    }
}
```


Если нужно тонко настроить - читайте [README.md](./README.md), в разделе по конкретному линтеру все описано

1. Запустить команду:
```sh
    yarn lint:fix
```
и исправить ошибки
