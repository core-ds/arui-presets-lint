# Гид по миграции на arui-presets-lint@11 с 9/10

[Обновляетесь с 8 на 9/10?](https://github.com/core-ds/arui-presets-lint/blob/v10.2.0/MIGRATION_GUIDE.md)

## Введение

Основные изменения:

- минимальная версия Node.js — **22.12.0** (поддержка Node.js v20 прекращена);
- 2 новых линтера (secretlint и knip) и дефолтный конфиг для хука pre-push в lefthook;
- в eslint: отключены `react/react-in-jsx-scope` и `react/jsx-uses-react`, добавлен плагин
  [react-you-might-not-need-an-effect](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect).

1. Убедиться, что в проекте Node.js **>= 22.12.0** (см. `engines` в `package.json` / CI).
   На Node.js v20 пакет больше не поддерживается.

2. Обновить зависимость:

```bash
yarn add arui-presets-lint@latest
```

и после этого запустить:
```bash
npx --no-install lefthook install
```

3. Проверить содержимое ключа `pre-push` в вашем lefthook.yml - arui-presets-lint начал поставлять дефолтную конфигурацию для него, не должно ничего дублироваться

4. Добавить конфиги knip и secretlint в корень проекта:

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

### Если knip в проекте уже стоял

Тогда одним `knip.ts` не обойтись - иначе пресет может вообще не применяться:

**Уберите `knip` из devDependencies проекта.** knip приезжает зависимостью arui-presets-lint. Если оставить свою версию и она не совпадёт с версией пресета, пакетный менеджер поставит вторую копию в `node_modules/arui-presets-lint/node_modules`, и `arui-presets-lint knip` запустит именно её (обёртка ищет бинарники начиная от каталога пресета), а прямой вызов `yarn knip` - вашу. Два разных knip на одном проекте дают разные репорты.

**Оставьте ровно один конфиг.** knip берёт первый найденный файл из списка и дальше не смотрит:

```text
knip.json, knip.jsonc, .knip.json, .knip.jsonc, knip.ts, knip.js, knip.config.ts, knip.config.js
```

`knip.json` идёт раньше `knip.ts` - если старый json оставить, новый `knip.ts` с пресетом будет молча проигнорирован. Ключ `knip` в package.json тоже читается: он мержится с файлом по верхнему уровню ключей, и файл выигрывает. Удалите и старый json, и ключ из package.json.

**Переносите свои настройки через spread базового конфига.** Массивы не объединяются - свой `entry`, `ignore` или `ignoreDependencies` затирает пресетный целиком, поэтому дописывать нужно к базовым:

```typescript
import { type KnipConfig } from 'knip';

import baseConfig from 'arui-presets-lint/knip';

export default {
    ...baseConfig,
    entry: [...baseConfig.entry, 'src/legacy/entry.ts'],
    ignoreDependencies: [...baseConfig.ignoreDependencies, 'some-implicit-dependency'],
} satisfies KnipConfig;
```

**Замените в скриптах вызов `knip` на `arui-presets-lint knip`** - обёртка добавляет `--no-config-hints` и кэш. Свои флаги по-прежнему можно передавать.

Первый прогон после перехода почти наверняка даст новые репорты: пресет принудительно включает плагины jest, vitest, storybook, playwright и cypress (в проектах экосистемы они обычно приходят через arui-scripts и по зависимостям knip их не видит) и задаёт свой набор `entry`.

5. Добавить в `package.json` скрипты запуска новых линтеров (`lint:unused`, `lint:secrets`) и дополнить ими `lint` и `lint:fix`:

```json
{
    "scripts": {
        "lint:styles": "arui-presets-lint styles",
        "lint:scripts": "arui-presets-lint scripts",
        "format": "arui-presets-lint format",
        "format:check": "arui-presets-lint format:check",
        "lint": "yarn lint:styles && yarn lint:scripts && yarn format:check && yarn lint:unused && yarn lint:secrets",
        "lint:fix": "yarn lint:styles --fix && yarn lint:scripts --fix && yarn format && yarn lint:secrets",
        "lint:unused": "arui-presets-lint knip",
        "lint:unused:fix": "arui-presets-lint knip --fix",
        "lint:secrets": "arui-presets-lint secretlint"
    }
}
```

> `knip --fix` удаляет неиспользуемые файлы, экспорты и зависимости, поэтому его нет в `lint:fix`. Сначала `yarn lint:unused`, после ревью отдельно выполнить `yarn lint:unused:fix`.

6. Учесть изменения eslint (уже в пресете, дополнительно ничего подключать не нужно):

- **`react/react-in-jsx-scope` и `react/jsx-uses-react` выключены.** С [автоматическим JSX runtime](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) (React 17+) импорт `React` в JSX-файлах не нужен. Если проект еще на стандартном runtime без нового transform, то отсутствие импорта по-прежнему сломает сборку; это ответственность самой сборки, а не eslint.
- **Добавлен плагин `eslint-plugin-react-you-might-not-need-an-effect`** с рекомендованным набором правил на уровне `warn`.

Если нужно тонко настроить - читайте [README.md](./README.md), в разделе по конкретному линтеру все описано

7. Запустить команду:
```sh
    yarn lint:fix
```
и исправить ошибки
