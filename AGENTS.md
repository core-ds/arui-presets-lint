# AGENTS.md

Инструкции для AI-агентов, работающих с этим репозиторием.

## Что это

Монорепозиторий общих конфигураций линтеров для react/node/typescript-проектов:

- `packages/arui-presets-lint` — основной пакет: конфиги eslint (flat config), prettier,
  stylelint, commitlint, secretlint, пресет knip, git-хуки lefthook и cli-обёртка
  (`arui-presets-lint <команда>`) для их запуска.
- `packages/stylelint-core-vars` — плагин stylelint `@alfalab/stylelint-core-vars`
  (миграция на дизайн-токены core-components).

Репозиторий линтит сам себя своими же конфигами (dogfooding), поэтому предупреждение
turbo о циклической зависимости пакетов — ожидаемое.

## Команды

Пакетный менеджер — yarn (версия зафиксирована в поле `packageManager` корневого
package.json, поддерживаемая версия Node — в `engines.node` пакетов).

```sh
yarn install          # установка
yarn build            # сборка обоих пакетов (turbo)
yarn test             # полный прогон: сборка, tsc, линтеры, юнит-тесты, knip, secretlint
yarn test:unit        # только юнит-тесты (vitest)
yarn lint             # все линтеры + knip + secretlint
yarn lint:fix         # то же с автофиксом
```

`yarn test` внутри пакета arui-presets-lint дополнительно запускает
`eslint-config-prettier` (поиск конфликтов с prettier) и `_internal/duplicates-checker.ts`.

## Правила и конвенции

- **Комментарии и документация — на русском.** Над правилами линтеров принято ставить
  ссылку на их документацию.
- **Формат кода** — prettier из этого же репо: 4 пробела, ширина 100, одинарные кавычки.
- **Коммиты** — conventional commits (проверяются commitlint):
  `feat(arui-presets-lint): ...`, `fix(stylelint-core-vars): ...`, `chore(deps): ...`.
- **Релизы — через changesets.** PR, который должен попасть в релиз, обязан содержать
  changeset (`yarn changeset`). Summary пишется по-русски с пользовательской точки зрения
  (см. CONTRIBUTING.md). После мержа в master бот создаёт релизный PR.
- Изменения правил линтеров требуют мотивации и проходят ревью по регламенту
  CONTRIBUTING.md (кворум владельцев из CODEOWNERS).

## Что важно знать

- **Git-хуки активны**: lefthook на pre-commit запускает линтеры и полный `yarn test`
  (запуск тестов на хуке — специфика именно этого репозитория), на commit-msg — commitlint.
  Коммит с падающими тестами не пройдёт.
- **Два разных конфига knip**: корневой `knip.ts` — для проверки самого репозитория;
  `packages/arui-presets-lint/knip/index.ts` — пресет, поставляемый потребителям пакета.
  Не путать при правках.
- **`dist/package.json` генерируется** скриптом `_internal/build-dist-package.ts`:
  в исходном package.json exports указывают на `.ts`-файлы, при сборке они переписываются
  на `.js`/`.d.ts`, а `workspace:*`-зависимости — на конкретные версии. Публикация идёт
  из `dist` (`publishConfig.directory`). Hint'ы knip про отсутствующие `cli/index.mjs`
  и `prettier/index.d.ts` — ожидаемы: эти файлы появляются только после сборки.
- **Юникод в русских комментариях**: часть текста хранится в декомпозированной форме NFD
  («й» = «и» + combining breve). Точечные строковые замены могут не находить текст —
  при неудаче матчитесь по соседним ASCII-фрагментам.
- Изменения пресетов затрагивают десятки проектов-потребителей с разными сборщиками
  и структурами: расширяя конфиги, предпочитайте паттерны-объединения конвенций,
  которые безвредны там, где не матчатся.

## CI

- `tests.yml` — прогон тестов на PR.
- `release.yml` — версионирование и публикация через changesets после мержа в master.
- `snapshot-release.yml` — ручной выпуск snapshot-версии для тестирования
  (нужен changeset в ветке).
