# Гид по миграции на arui-presets-lint@12 с 11

[Обновляетесь с 9/10 на 11?](https://github.com/core-ds/arui-presets-lint/blob/arui-presets-lint%4011.4.0/packages/arui-presets-lint/MIGRATION_GUIDE.md)

## 1. Обновите Node.js

Локально и в CI используйте Node.js **22.13.0+ в ветке 22** либо **24.0.0+**.

## 2. Обновите зависимости

```sh
yarn add -D arui-presets-lint@latest
```

Для параллельного запуска проверок установите `concurrently`: `yarn add -D concurrently@latest`.

Если `eslint` закреплён в проекте отдельно, обновите его до 10.x. Дополнительные ESLint-плагины
обновите до версий с поддержкой ESLint 10.

## 3. Замените имена правил

В `eslint.config.*` и комментариях `eslint`, `eslint-disable`, `eslint-disable-next-line`,
`eslint-disable-line`, `eslint-enable` обновите ссылки на правила:

| Было                                      | Стало                                     |
| ----------------------------------------- | ----------------------------------------- |
| `jsx-a11y/*`                              | `jsx-a11y-x/*`                            |
| `react/no-array-index-key`                | `react-x/no-array-index-key`              |
| `react/no-unstable-nested-components`     | `react-x/no-nested-component-definitions` |
| `react/jsx-no-constructed-context-values` | `react-x/no-unstable-context-value`       |
| `react/no-danger`                         | `react-dom/no-dangerously-set-innerhtml`  |
| `react/no-unknown-property`               | `react-dom/no-unknown-property`           |
| `react/jsx-no-target-blank`               | `react-dom/no-unsafe-target-blank`        |
| `react/no-children-prop`                  | `react-jsx/no-children-prop`              |
| `react-hooks/rules-of-hooks`              | `react-x/rules-of-hooks`                  |
| `react-hooks/exhaustive-deps`             | `react-x/exhaustive-deps`                 |
| `react-hooks/void-use-memo`               | `react-x/use-memo`                        |
| Остальные `react-hooks/*`                 | `react-x/*` с тем же именем               |
| `unicorn/no-array-for-each`               | `unicorn/no-for-each`                     |
| `unicorn/no-unused-array-method-return`   | `unicorn/no-unused-builtin-method-return` |
| `unicorn/no-hex-escape`                   | `unicorn/prefer-literal-ascii`            |

Остальные `react/*` замените по [таблице миграции React](https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react).
Удалите переопределения и комментарии отключения правил без аналога, включая
`react/jsx-uses-react`, `react/jsx-uses-vars`, `react/jsx-no-undef`, `jsx-a11y/accessible-emoji`,
`jsx-a11y/label-has-for` и `jsx-a11y/no-onchange`.

Удалите переопределения и комментарии отключения правил без аналога:

- `react-hooks/config`
- `react-hooks/gating`
- `react-hooks/incompatible-library`
- `react-hooks/preserve-manual-memoization`

Проверьте опции перенесённых правил по документации новых правил:
[React](https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react),
[Hooks](https://eslint-react.xyz/docs/migrating-from-eslint-plugin-react-hooks),
[JSX-a11y-x](https://github.com/eslint-community/eslint-plugin-jsx-a11y-x#migrating-from-eslint-plugin-jsx-a11y).

## 4. Перенесите собственные настройки плагинов

- Версию React из `settings.react.version` перенесите в `settings['react-x'].version`.
- Настройки доступности из `settings['jsx-a11y']` перенесите в `settings['jsx-a11y-x']`.
- Настройку `settings['react-hooks'].additionalEffectHooks` перенесите в
  `settings['react-x'].additionalEffectHooks`, задав регулярное выражение строкой с `/`,
  например `'/^(useProjectEffect|useCustomEffect)$/u'`.
- Остальные настройки `settings.react` перенесите по [документации нового анализатора](https://eslint-react.xyz/docs/configuration/configure-analyzer).

## 5. Обновите конфигурацию под ESLint 10

Удалите комментарии `/* eslint-env ... */`, а глобальные переменные из них перенесите в
`languageOptions.globals` в `eslint.config.*`.

В монорепозитории проверьте каждый `eslint.config.*`: ESLint 10 выбирает ближайший к проверяемому
файлу конфиг. Явно подключите в нём общий пресет и общие игноры. Если скрипт должен использовать
один конкретный конфиг, передайте его через `--config`.

## 6. Проверьте переопределения Lefthook

Если вы переопределяете или отключаете `pre-push.commands.check-scripts` / `check-styles`,
отдельно настройте `pre-push.commands.check-format`: проверка Prettier перенесена в неё.

## 7. Исправьте ошибки и проверьте проект

```sh
yarn lint:scripts
```

Исправьте новые сообщения ESLint и Unicorn. При необходимости автофикса запустите
`yarn lint:scripts --fix` и проверьте изменения, в том числе совместимость предлагаемых API
с целевыми браузерами и Node.js проекта. Затем запустите полный линт и тесты проекта.
