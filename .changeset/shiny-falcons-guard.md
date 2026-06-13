---
'arui-presets-lint': major
---


- Добавлен новый линтер - [secretlint](https://github.com/secretlint/secretlint) для поиска случайно закоммиченных секретов: проверка staged-файлов на pre-commit хуке lefthook и команда `arui-presets-lint secretlint` для полной проверки проекта. Необходимо добавить конфиг в проект.

- Добавлен новый линтер - [knip](https://knip.dev) для поиска неиспользуемых файлов, зависимостей и экспортов: базовый конфиг `arui-presets-lint/knip` и команда `arui-presets-lint knip` в cli-утилите Необходимо добавить конфиг в проект.

- Дефолтный конфиг для pre-push хука в lefthook

- Обновлен README и добавлен [MIGRATION_GUIDE](https://github.com/core-ds/arui-presets-lint/blob/master/packages/arui-presets-lint/MIGRATION_GUIDE.md) для новой версии
