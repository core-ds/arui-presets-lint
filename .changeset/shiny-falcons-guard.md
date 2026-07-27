---
'arui-presets-lint': major
---

- Прекращена поддержка NodeJS 20 - минимальная версия теперь 22.12.0.

- Добавлен новый линтер - [secretlint](https://github.com/secretlint/secretlint) для поиска случайно закоммиченных секретов: проверка staged-файлов на pre-commit хуке lefthook и команда `arui-presets-lint secretlint` для полной проверки проекта. Необходимо добавить конфиг в проект.

- Добавлен новый линтер - [knip](https://knip.dev) для поиска неиспользуемых файлов, зависимостей и экспортов: базовый конфиг `arui-presets-lint/knip` и команда `arui-presets-lint knip` в cli-утилите. Необходимо добавить конфиг в проект.

- Дефолтный конфиг для pre-push хука в lefthook

- В конфигурацию eslint добавлен плагин [react-you-might-not-need-an-effect](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect) с рекомендованным набором правил (уровень warn) - подсказывает, где useEffect не нужен и его можно заменить более простым кодом

- Отключены правила `react/react-in-jsx-scope` и `react/jsx-uses-react` - с [автоматическим JSX runtime](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html) (React 17+) импорт React в JSX-файлах не требуется, а на классическом runtime его отсутствие и так ломает сборку

- Обновлен README и добавлен [MIGRATION_GUIDE](https://github.com/core-ds/arui-presets-lint/blob/master/packages/arui-presets-lint/MIGRATION_GUIDE.md) для новой версии
