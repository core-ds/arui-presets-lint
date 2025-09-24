---
'arui-presets-lint': major
---

ESlint 9, ESM only и многое другое...

## Breaking Changes

- конфиги поставляются только в esm, минимальная версия node - 18.18.0
- удален плагин [eslint-plugin-cypress](https://www.npmjs.com/package/eslint-plugin-cypress) и сопутствующие правила
- [eslint-plugin-import](https://www.npmjs.com/package/eslint-plugin-import) заменен на [eslint-plugin-import-x](https://www.npmjs.com/package/eslint-plugin-import-x)
- [eslint-plugin-dirnames](https://www.npmjs.com/package/eslint-plugin-dirnames) заменен на [eslint-plugin-check-file](https://www.npmjs.com/package/eslint-plugin-check-file)
- содержимое конфигов [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb), [eslint-config-airbnb-typescript](https://www.npmjs.com/package/eslint-config-airbnb-typescript), [eslint-config-airbnb-base](https://www.npmjs.com/package/eslint-config-airbnb-base) переведено в eslint-flat-config и перенесено внутрь нашей библиотеки
- отключен eslint cache, так как он периодически вызывал проблемы и работал [ненадежно](https://typescript-eslint.io/troubleshooting/faqs/eslint/#can-i-use-eslints---cache-with-typescript-eslint)
- typescript-eslint обновлен до 8 версии, включен новый [projectService](https://typescript-eslint.io/blog/project-service/#introducing-the-project-service)
- в eslint для окружения node включен eslint-plugin-n с набором правил [recommended](https://github.com/eslint-community/eslint-plugin-n?tab=readme-ov-file#-rules)

## New Features

- добавлен набор правил [eslint-plugin-unicorn-recommended](https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main?tab=readme-ov-file#rules)
- добавлен набор правил [eslint-plugin-jsx-a11y-recommended](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y?tab=readme-ov-file#supported-rules)
- добавлены наборы правил [eslint-plugin-react-recommended](https://github.com/jsx-eslint/eslint-plugin-react?tab=readme-ov-file#list-of-supported-rules) и eslint-plugin-react-hooks-recommended. исправляет [этот баг](https://github.com/core-ds/arui-presets-lint/issues/50)
- добавлен набор правил [typescript-eslint-recommended-type-checked](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended-type-checked.ts)
- добавлен набор правил [eslint-recommended](https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js)
- экспорты объявлены через декларацию [exports](https://nodejs.org/api/packages.html#package-entry-points) в package.json
- пути файлов удалены из вызова cli eslint - теперь все определяется в конфиге. добавлена библиотека [eslint-config-flat-gitignore](https://www.npmjs.com/package/eslint-config-flat-gitignore) для поддержки учитывания файлов .gitignore и .eslintignore
- обновлены зависимости и yarn до последней версии
- флоу выпуска библиотеки переведен с conventional-cli на changesets-cli

## Bugfixes

- Исправлено отображение ворнингов на precommit при наличии файла в eslintignore https://github.com/core-ds/arui-presets-lint/issues/28
