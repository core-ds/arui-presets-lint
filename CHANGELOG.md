## 9.0.1

## 9.0.2

### Patch Changes

- [#82](https://github.com/core-ds/arui-presets-lint/pull/82) [`76c10fe`](https://github.com/core-ds/arui-presets-lint/commit/76c10fe13a175ea89b664c2b727009cfa1638ddf) Thanks [@heymdall-legal](https://github.com/heymdall-legal)! - Выключено правило no-continue

### Major Changes

- [#53](https://github.com/core-ds/arui-presets-lint/pull/53) [`909ac7d`](https://github.com/core-ds/arui-presets-lint/commit/909ac7d696a0ef2d56993688878e738dbad193db) Thanks [@kiskv](https://github.com/kiskv)! - ESlint 9, ESM only и многое другое...

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
    - добавлен набор правил [eslint-plugin-unicorn-unopinionated](https://github.com/sindresorhus/eslint-plugin-unicorn/tree/main?tab=readme-ov-file#rules)
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

# [8.8.1](https://github.com/core-ds/arui-presets-lint/compare/v8.8.0...v8.8.1) (2025-08-25)

### Bug Fixes

- **a11y:** кнопки из core-components добавлены в настройки a11y ([a58d229](https://github.com/core-ds/arui-presets-lint/commit/a58d2297523d09e899ac49b1638bb2313a20325a))

# [8.8.0](https://github.com/core-ds/arui-presets-lint/compare/v8.7.0...v8.8.0) (2025-06-24)

### Features

- update jsx-filename-extension rule ([0b66b5a](https://github.com/core-ds/arui-presets-lint/commit/0b66b5a24d8a6109932deb1039f5fabd567302e8))

# [8.7.0](https://github.com/core-ds/arui-presets-lint/compare/v8.6.0...v8.7.0) (2025-04-17)

### Bug Fixes

- **eslint:** set --ignore-path to .gitignore ([32b57e5](https://github.com/core-ds/arui-presets-lint/commit/32b57e5a798d20270287b5803a44dc24b5be5dd9))
- **lefthook:** add --allow-empty-input to stylelint call ([f8281b6](https://github.com/core-ds/arui-presets-lint/commit/f8281b6622328d7c29e376763af8fafd0432b1a1))

### Features

- upgrade dependencies ([7a9465d](https://github.com/core-ds/arui-presets-lint/commit/7a9465d86b7c3bf6fa1ffe27eadbb8cde7154556))

# [8.6.0](https://github.com/core-ds/arui-presets-lint/compare/v8.5.0...v8.6.0) (2025-02-12)

### Features

- add new rules for eslint ([8f75cb8](https://github.com/core-ds/arui-presets-lint/commit/8f75cb89e0b5b7ab428378807eb9613c97ba6209))

# [8.5.0](https://github.com/core-ds/arui-presets-lint/compare/v8.4.0...v8.5.0) (2025-01-31)

### Features

- add new rules for eslint max-params and max-lines ([e2d4f6a](https://github.com/core-ds/arui-presets-lint/commit/e2d4f6a9acb6a370c0b3f3341288deb3275de18d))

# [8.4.0](https://github.com/core-ds/arui-presets-lint/compare/v8.3.0...v8.4.0) (2025-01-13)

### Features

- added new ts rule ([b66a2dd](https://github.com/core-ds/arui-presets-lint/commit/b66a2ddb123afbdfcc84371f023643f3ee795d46))

# [8.3.0](https://github.com/core-ds/arui-presets-lint/compare/v8.2.0...v8.3.0) (2024-12-13)

### Features

- **stylelint:** add ability to use pseudo class global ([5d220df](https://github.com/core-ds/arui-presets-lint/commit/5d220df9abf47eb8c37ae05d6f8fa0075789d473))

# [8.2.0](https://github.com/core-ds/arui-presets-lint/compare/v8.1.0...v8.2.0) (2024-12-02)

### Features

- bump dependencies, add stylelint-core-vars with bugfixes ([6d36d0a](https://github.com/core-ds/arui-presets-lint/commit/6d36d0a980feaad68146a1f7a50cf2ea7a1c1ad0))
- **lefthook:** remove unused parallel setting from commit-msg hook ([e8acd61](https://github.com/core-ds/arui-presets-lint/commit/e8acd616013e7a2891fd8614858e861be7e67214))

# [8.1.0](https://github.com/core-ds/arui-presets-lint/compare/v8.0.1...v8.1.0) (2024-11-01)

### Bug Fixes

- **prettier:** fix prettier newlines on windows ([0120a00](https://github.com/core-ds/arui-presets-lint/commit/0120a0062a54a73022d89ea036216bc869a4070d))

### Features

- bump dependencies ([5c51205](https://github.com/core-ds/arui-presets-lint/commit/5c51205e9af81b706e34ad5bced36d7ec5d46b78))
- **cli:** add --list-different flag for format command ([2a845a7](https://github.com/core-ds/arui-presets-lint/commit/2a845a7579d9f0d0bcf490411839de6d67037652))

## [8.0.1](https://github.com/core-ds/arui-presets-lint/compare/v8.0.0...v8.0.1) (2024-10-31)

### Bug Fixes

- fix grammatical mistakes ([1819ba1](https://github.com/core-ds/arui-presets-lint/commit/1819ba11ae593f2072a98e00fd2425ce231298a4))

# [8.0.0](https://github.com/core-ds/arui-presets-lint/compare/v7.6.2...v8.0.0) (2024-10-29)

- feat(\*)!: remove all peerdeps ([2ac2d86](https://github.com/core-ds/arui-presets-lint/commit/2ac2d8697ed4a68dd10cc425af16cf2732948083))

### Features

- add lefthook and cli, remove simple-git-hooks and lint-staged ([d83b53b](https://github.com/core-ds/arui-presets-lint/commit/d83b53b47e0fb27958aea7ada1ada83f7a01b26c))
- bump react, typescript and core-components in dev dependency ([162f66f](https://github.com/core-ds/arui-presets-lint/commit/162f66f05109653d37d57275ea8b1728e9d7cebb))
- update yarn to 4.5.1 ([250b8ae](https://github.com/core-ds/arui-presets-lint/commit/250b8aee2a46c1ecd0ff11524a85653971c41d64))

### BREAKING CHANGES

- peer dependencies no longer supported

## [7.6.2](https://github.com/core-ds/arui-presets-lint/compare/v7.6.1...v7.6.2) (2024-09-18)

### Bug Fixes

- **eslint:** optimize regex for mixed language rule ([7f021cb](https://github.com/core-ds/arui-presets-lint/commit/7f021cbd02bc69db9d28f68405edcdbd29abe850))

## [7.6.1](https://github.com/core-ds/arui-presets-lint/compare/v7.6.0...v7.6.1) (2024-09-08)

### Bug Fixes

- **stylelint:** allow duplicate properties with different syntaxes ([3e0e5af](https://github.com/core-ds/arui-presets-lint/commit/3e0e5af57c0d470ae3de7052078bb3ca6e67a309))

# [7.6.0](https://github.com/core-ds/arui-presets-lint/compare/v7.5.0...v7.6.0) (2024-08-19)

### Bug Fixes

- **stylelint:** rule for module only; ([1a73b15](https://github.com/core-ds/arui-presets-lint/commit/1a73b151ff0931cc2e0a3b7c806280f63edcbd9b))

### Features

- **stylelint:** add rule; selector-class-pattern ([26e3c55](https://github.com/core-ds/arui-presets-lint/commit/26e3c551a1ce68946bf6a6ffbf119c69d64e81b0))

# [7.5.0](https://github.com/core-ds/arui-presets-lint/compare/v7.4.0...v7.5.0) (2024-08-16)

### Features

- **stylelint:** add stylelint duplications check ([cb95219](https://github.com/core-ds/arui-presets-lint/commit/cb9521959675c4fb5391cfa16811c134e092b95b))

# [7.4.0](https://github.com/core-ds/arui-presets-lint/compare/v7.3.0...v7.4.0) (2024-08-14)

### Features

- **eslint:** enabled consistent-type-imports, ban propsWithChildren and atomic lodash ([3b03627](https://github.com/core-ds/arui-presets-lint/commit/3b036274d8535840ce47083495fe90d30ef86d8a))

# [7.3.0](https://github.com/core-ds/arui-presets-lint/compare/v7.2.0...v7.3.0) (2024-04-24)

### Features

- **no-cycle:** enable rule ([861aa71](https://github.com/core-ds/arui-presets-lint/commit/861aa71ae2b3b804489905c2a15e0619afbb5da3))

# [7.2.0](https://github.com/core-ds/arui-presets-lint/compare/v7.1.1...v7.2.0) (2024-04-10)

### Features

- allow 7 version for typescript-eslint in peerdeps ([8f9c0cc](https://github.com/core-ds/arui-presets-lint/commit/8f9c0cca96c4e0771bb529747adeee54d65e3b7b))
- bump dependencies ([0c86c4e](https://github.com/core-ds/arui-presets-lint/commit/0c86c4e79b9632114b10435fa77cd4fd81bd8b93))
- bump yarn to 4.1.1 ([2f720c3](https://github.com/core-ds/arui-presets-lint/commit/2f720c3da0534c7ddfea95738ac1cf2bbe02ba7d))
- **eslint:** set ecma version to 2022 for ts parser ([9ed55d6](https://github.com/core-ds/arui-presets-lint/commit/9ed55d6617b09d0cbb786758de8b4857c8cbac89))
- replace husky 4 to simple-git-hooks ([91232d8](https://github.com/core-ds/arui-presets-lint/commit/91232d8d9c94733b8d474eef09138c9dd6e76363))

## [7.1.1](https://github.com/core-ds/arui-presets-lint/compare/v7.1.0...v7.1.1) (2024-02-28)

### Bug Fixes

- **commitlint:** downgrade for fix RangeError commitlint issue ([6ef2bfa](https://github.com/core-ds/arui-presets-lint/commit/6ef2bfa41aa0bc6290f8dfbe17a2a0abecc45595))

# [7.1.0](https://github.com/core-ds/arui-presets-lint/compare/v7.0.1...v7.1.0) (2024-02-27)

### Features

- bump various dependencies ([4184a5d](https://github.com/core-ds/arui-presets-lint/commit/4184a5d4b1b4a574564972fbddbdd1db1452ce19))

## [7.0.1](https://github.com/core-ds/arui-presets-lint/compare/v7.0.0...v7.0.1) (2024-01-27)

### Bug Fixes

- **ci:** fix new library package job for protected branches ([#4](https://github.com/core-ds/arui-presets-lint/issues/4)) ([f27fce0](https://github.com/core-ds/arui-presets-lint/commit/f27fce011c336cc1b6b8582e8350fb8e2c08b2ca))

# [7.0.0](https://github.com/core-ds/arui-presets-lint/compare/v6.3.0...v7.0.0) (2023-12-22)

- feat(\*)!: remove arui-feather dependencies, fix test runner ([fde224c](https://github.com/core-ds/arui-presets-lint/commit/fde224c2eecfcfa09aad305b878bcbe418c44e96))
- feat(\*)!: bump dependencies ([aa78faa](https://github.com/core-ds/arui-presets-lint/commit/aa78faab6be218592665cbffe1b0b46122eceb48))

### Features

- add release config for beta branch ([50025ca](https://github.com/core-ds/arui-presets-lint/commit/50025ca3f5b58f0cf1e5aa77ea13e052e08047ad))
- bump dependencies ([b90a40c](https://github.com/core-ds/arui-presets-lint/commit/b90a40cd2dbc6b1471055cd3b4b724f20ed7460e))
- bump stylelint to 16 ([4ca3432](https://github.com/core-ds/arui-presets-lint/commit/4ca3432e353b4f42b869242216489d5ffaf33b69))
- bump yarn ([315c6ef](https://github.com/core-ds/arui-presets-lint/commit/315c6efdb326ac812a99b110427fca781e685d93))
- cleanup package content ([e12e8c7](https://github.com/core-ds/arui-presets-lint/commit/e12e8c760f8f4ea5b300508d50eba1fa5af199d5))
- modify tests ([49f9c06](https://github.com/core-ds/arui-presets-lint/commit/49f9c06be2ba5cdbde27ee4226a86834fd573fb5))

### BREAKING CHANGES

- remove arui-feather support
- remove support for node <18

# [7.0.0](https://github.com/core-ds/arui-presets-lint/compare/v6.3.0...v7.0.0) (2023-12-22)

- feat(\*)!: remove arui-feather dependencies, fix test runner ([fde224c](https://github.com/core-ds/arui-presets-lint/commit/fde224c2eecfcfa09aad305b878bcbe418c44e96))
- feat(\*)!: bump dependencies ([aa78faa](https://github.com/core-ds/arui-presets-lint/commit/aa78faab6be218592665cbffe1b0b46122eceb48))

### Features

- add release config for beta branch ([50025ca](https://github.com/core-ds/arui-presets-lint/commit/50025ca3f5b58f0cf1e5aa77ea13e052e08047ad))
- bump dependencies ([b90a40c](https://github.com/core-ds/arui-presets-lint/commit/b90a40cd2dbc6b1471055cd3b4b724f20ed7460e))
- bump stylelint to 16 ([4ca3432](https://github.com/core-ds/arui-presets-lint/commit/4ca3432e353b4f42b869242216489d5ffaf33b69))
- bump yarn ([315c6ef](https://github.com/core-ds/arui-presets-lint/commit/315c6efdb326ac812a99b110427fca781e685d93))
- cleanup package content ([e12e8c7](https://github.com/core-ds/arui-presets-lint/commit/e12e8c760f8f4ea5b300508d50eba1fa5af199d5))
- modify tests ([49f9c06](https://github.com/core-ds/arui-presets-lint/commit/49f9c06be2ba5cdbde27ee4226a86834fd573fb5))

### BREAKING CHANGES

- remove arui-feather support
- remove support for node <18

# 6.3.0 (2023-12-01)

### Features

- change ci configs 30f7d14

# 6.2.0 (2023-05-24)

### Features

- **eslint:** forbid import of lodash 7df02af

# 6.1.0 (2022-12-09)

### Features

- dump stylelint-core-vars fafcdfd
- separate lint and format, remove incremental false from husky 75d15b9

## 6.0.1 (2022-07-27)

### Bug Fixes

- **eslint:** fix node12 support 4d52210

# 6.0.0 (2022-07-25)

### Features

- add .yarnrc aac625f
- bump semantic-release, change repository url e98a7bc
- update deps a90bac2
- update lint-staged and husky 1fe7d74
- **build:** remove github from release config 5c361e4
- **build:** remove repo from release config c8d28ca
- **commitlint:** increase body-max-line-length 006ca95
- **commitlint:** update commitlint libs d7bfec1
- **eslint:** forbid unnecessary template literals for best prettier compatibility eee9f53
- **eslint:** remove harmful eslint rules after testing 561115a
- **gitignore:** add .DS_Store to .gitignore 272ae54
- **package.json:** remove repo link from package.json 64b8068
- **stylelint:** update stylelint, remove stylelint-prettier a61f26f

- feat(eslint)!: update eslint and plugins, add eslint-config-prettier, remove prettier-eslint 0787329

### BREAKING CHANGES

- dropping eslint <8 support, remove prettier-eslint

# [5.10.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.9.0...v5.10.0) (2021-11-01)

### Bug Fixes

- delete extra comment ([fec77cc](https://github.com/alfa-laboratory/arui-presets-lint/commit/fec77ccd5bb41cc3641729ea5fead768d88f141c))
- remarks from pr ([fa6f23f](https://github.com/alfa-laboratory/arui-presets-lint/commit/fa6f23f0ba86d12c3b24c8e65d8c8e872d234dad))
- return old husky ([95b8201](https://github.com/alfa-laboratory/arui-presets-lint/commit/95b82016adbba11e75585b27b4e1966beb77f44c))
- update yarnlock ([d8885f7](https://github.com/alfa-laboratory/arui-presets-lint/commit/d8885f755e10ece1c2c77e513a6b34e393feb81f))

### Features

- up libs ([08d4e78](https://github.com/alfa-laboratory/arui-presets-lint/commit/08d4e78024ad8b99b04d9e6e7848dd5d3056b7ad))

# [5.9.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.8.0...v5.9.0) (2021-09-03)

### Features

- **stylelint:** add stylelint-core-vars ([fca461d](https://github.com/alfa-laboratory/arui-presets-lint/commit/fca461dc5a2c95afb6d0be4af1a395fb0c270ecb))

# [5.8.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.7.0...v5.8.0) (2021-05-14)

### Features

- **eslint:** forbid to use context.only and test.only ([cfae8a5](https://github.com/alfa-laboratory/arui-presets-lint/commit/cfae8a5d7f42faacf24d0fbf716d2c3454ab6f65))
- **eslint:** forbid to use it.only and describe.only ([dd83d79](https://github.com/alfa-laboratory/arui-presets-lint/commit/dd83d79417ca89b2e1534cbe5617832d9eac5f47))

# [5.7.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.6.0...v5.7.0) (2021-03-10)

### Features

- **eslint:** add 'no-shadow' ts rule ([5817957](https://github.com/alfa-laboratory/arui-presets-lint/commit/5817957cbaa656f868bf67f4ec4b33e69b78d233))
- **eslint:** off eslint 'no-use-before-define' ([092093b](https://github.com/alfa-laboratory/arui-presets-lint/commit/092093bfd39944c8da7c241397456cafdd49b765))

# [5.6.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.5.0...v5.6.0) (2021-02-16)

### Bug Fixes

- fix yarn audit prototype pollution ([ee38bac](https://github.com/alfa-laboratory/arui-presets-lint/commit/ee38bac939329e261593153af4e28f5039503ac8))

### Features

- add eslint rule for check filenames ([07b48b5](https://github.com/alfa-laboratory/arui-presets-lint/commit/07b48b5e29d3fac6115fb84d10e982ea71729af1))
- update eslint-plugin-dirnames version ([2a14bb2](https://github.com/alfa-laboratory/arui-presets-lint/commit/2a14bb23d2d80283222e7d368607b056a8764cd6))
- update lint for check filenames & dirnames ([434b48a](https://github.com/alfa-laboratory/arui-presets-lint/commit/434b48acc94e5c15e2e1b15cce3b1e8df13c7cf7))
- update package.json ([e39da16](https://github.com/alfa-laboratory/arui-presets-lint/commit/e39da1640c3176e6116f56a082dd41c81c50755b))
- update yarn.lock ([3f708aa](https://github.com/alfa-laboratory/arui-presets-lint/commit/3f708aa264ff18eb746deb848285cabf105f4638))
- update yarn.lock ([1abc126](https://github.com/alfa-laboratory/arui-presets-lint/commit/1abc126673b37764509bbeb16905fa263dfac324))

# [5.5.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.4.1...v5.5.0) (2021-02-12)

### Features

- **eslint:** add padding-line-between-statements rule ([46da359](https://github.com/alfa-laboratory/arui-presets-lint/commit/46da3591c67a6d44db73516d14419852837c4faa))

## [5.4.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.4.0...v5.4.1) (2021-01-25)

### Bug Fixes

- **eslint:** add ignore typescript generic type params ([f7c1d35](https://github.com/alfa-laboratory/arui-presets-lint/commit/f7c1d354234a1f7bec7da1c157333b97bccf6bdc))

# [5.4.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.3.1...v5.4.0) (2020-12-14)

### Features

- disable jsx-one-expression-per-line ([bcba37b](https://github.com/alfa-laboratory/arui-presets-lint/commit/bcba37b9516306011a8914403814990d6336d7e8))

## [5.3.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.3.0...v5.3.1) (2020-10-02)

### Bug Fixes

- adds new package for semantic-release ([e999b7b](https://github.com/alfa-laboratory/arui-presets-lint/commit/e999b7b7591c7d2eacbcb2a13d903ecb6855c895))
- adds token for npm-publish ([73ccf46](https://github.com/alfa-laboratory/arui-presets-lint/commit/73ccf46f0325d21eea8875e38756d78ef23d7add))
- changed rules for codeowners ([8d40eb0](https://github.com/alfa-laboratory/arui-presets-lint/commit/8d40eb0fb1d26440e751809d5cdaf85ae68f1094))
- changed rules for CODEOWNERS ([7d7cd38](https://github.com/alfa-laboratory/arui-presets-lint/commit/7d7cd3889e30ce08d8bac2367cc3ffc9da46cb1b))
- changed version ([26adf63](https://github.com/alfa-laboratory/arui-presets-lint/commit/26adf632ce7e79bb821aab5272c22bfed8c5f66b))

# [5.1.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v5.0.0...v5.1.0) (2020-09-03)

### Features

- update prettier, stylelint ([55b3aa4](https://github.com/alfa-laboratory/arui-presets-lint/commit/55b3aa472c3c584bf1606c765d20acd348ad06a0))

# [5.0.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.3.0...v5.0.0) (2020-08-26)

### Bug Fixes

- adds all deleted dependencies ([823a275](https://github.com/alfa-laboratory/arui-presets-lint/commit/823a2757ffa4f99c4c8ba6062ce9df926cde0858))

### Features

- add some rules ([7e1ec33](https://github.com/alfa-laboratory/arui-presets-lint/commit/7e1ec3380f5e2993fbe4032a42cd2699aaf8cbb8))
- add some rules ([ecec52a](https://github.com/alfa-laboratory/arui-presets-lint/commit/ecec52a6d7184c795f4e78bec55845f95e51d24f))
- resolve yarn.lock ([85b5ae7](https://github.com/alfa-laboratory/arui-presets-lint/commit/85b5ae771c4c8a08f9a30aad486a22a9934a116c))
- **eslint:** add .eslintrc.js in .eslintignore ([b22988a](https://github.com/alfa-laboratory/arui-presets-lint/commit/b22988a6a3b1e3afed54f76a4de3a85d63ff607d))
- **eslint:** removed node.js v8.\* support ([abb7ed8](https://github.com/alfa-laboratory/arui-presets-lint/commit/abb7ed834518d82e47448f9fe91e5bd267d0f1ce))
- **eslint:** update config for eslint ([cad9237](https://github.com/alfa-laboratory/arui-presets-lint/commit/cad92374b6db1ea1db9d2f80eaaf0407f6dbb7fb))
- **eslint:** update deps ([5516c1c](https://github.com/alfa-laboratory/arui-presets-lint/commit/5516c1c16b51e471d89fd76b895c93ceb0acb750))

### BREAKING CHANGES

- dropped node.js 8 support, eslint was updated from 6 to 7

# [4.3.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.2.3...v4.3.0) (2020-08-24)

### Bug Fixes

- adds some fix ([396dfea](https://github.com/alfa-laboratory/arui-presets-lint/commit/396dfea6fa159c08287fcd9a5fff008bcff467df))
- **eslint:** replace deprecated label-has-for ([a24ab8e](https://github.com/alfa-laboratory/arui-presets-lint/commit/a24ab8e838bc40abfdbc6d341233a53507d15d58)), closes [#56](https://github.com/alfa-laboratory/arui-presets-lint/issues/56)

### Features

- adds dependencies for semantic-release ([18c84a3](https://github.com/alfa-laboratory/arui-presets-lint/commit/18c84a3ed7b067497295983407ecd4fb0c7a2463))
- adds new github token ([a903035](https://github.com/alfa-laboratory/arui-presets-lint/commit/a9030359af27204457656f9caada2bee174387a9))
- adds new github workflows ([28621e2](https://github.com/alfa-laboratory/arui-presets-lint/commit/28621e2f4b301dbe0e03740645e3e8ffc62a8e07))
- adds release.config for semantic-release ([d517bfd](https://github.com/alfa-laboratory/arui-presets-lint/commit/d517bfdbc72c377805ec55de21dcc047169fea14))
- **nodejs:** deleted test for 8th node's version ([edf247e](https://github.com/alfa-laboratory/arui-presets-lint/commit/edf247ed5731cc7158e182bb1006a2370770133e))

<a name="4.2.3"></a>

## [4.2.3](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.2.2...v4.2.3) (2020-07-09)

### Features

- **upgrade:** upgraded a library ([#75](https://github.com/alfa-laboratory/arui-presets-lint/issues/75)) ([a8fb323](https://github.com/alfa-laboratory/arui-presets-lint/commit/a8fb323))

<a name="4.2.2"></a>

## [4.2.2](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.2.1...v4.2.2) (2020-06-22)

### Bug Fixes

- **eslint:** disable max-len explicitly ([e58103f](https://github.com/alfa-laboratory/arui-presets-lint/commit/e58103f))

<a name="4.2.1"></a>

## [4.2.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.2.0...v4.2.1) (2020-06-22)

### Bug Fixes

- **eslint:** disable conflict rules ([d4b2af5](https://github.com/alfa-laboratory/arui-presets-lint/commit/d4b2af5))
- **eslint:** remove max-len ([ab5be9c](https://github.com/alfa-laboratory/arui-presets-lint/commit/ab5be9c))

<a name="4.2.0"></a>

# [4.2.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.1.3...v4.2.0) (2020-04-30)

### Features

- **upgrade:** add no-useles-path-segments rule ([043fdc6](https://github.com/alfa-laboratory/arui-presets-lint/commit/043fdc6))

<a name="4.1.2"></a>

## [4.1.2](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.1.1...v4.1.2) (2020-04-09)

### Bug Fixes

- **eslint:** added avoidEscape for quotes ([cbd63d8](https://github.com/alfa-laboratory/arui-presets-lint/commit/cbd63d8))

### Features

- add dirnames eslint rule ([d33eb66](https://github.com/alfa-laboratory/arui-presets-lint/commit/d33eb66))

<a name="4.1.1"></a>

## [4.1.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.1.0...v4.1.1) (2020-04-06)

### Bug Fixes

- update yarn.lock ([eab5945](https://github.com/alfa-laboratory/arui-presets-lint/commit/eab5945))
- **arui-cssvars:** fix library ([0599231](https://github.com/alfa-laboratory/arui-presets-lint/commit/0599231))
- **arui-cssvars:** update lib version to skip warnings when linter rule is disabled ([c1e4565](https://github.com/alfa-laboratory/arui-presets-lint/commit/c1e4565))

<a name="4.1.0"></a>

# [4.1.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v4.0.0...v4.1.0) (2020-03-26)

### Bug Fixes

- **eslint:** allow to import devDependencies in storybook and test files ([ec264d4](https://github.com/alfa-laboratory/arui-presets-lint/commit/ec264d4))
- **eslint:** resolve conflict with prettier ([1be5db5](https://github.com/alfa-laboratory/arui-presets-lint/commit/1be5db5))

### Features

- **eslint:** add cypress support ([f93f601](https://github.com/alfa-laboratory/arui-presets-lint/commit/f93f601))

<a name="4.0.0"></a>

# [4.0.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v3.0.1...v4.0.0) (2020-03-18)

### Bug Fixes

- **eslint:** disable indent and max-len rules ([97967ed](https://github.com/alfa-laboratory/arui-presets-lint/commit/97967ed))
- **eslint:** use ts parser for all files ([609cda5](https://github.com/alfa-laboratory/arui-presets-lint/commit/609cda5))
- **package:** fix yarn audit errors ([3f73abc](https://github.com/alfa-laboratory/arui-presets-lint/commit/3f73abc))
- **package:** restore version string ([a59243c](https://github.com/alfa-laboratory/arui-presets-lint/commit/a59243c))

### Features

- add prettier ([077b698](https://github.com/alfa-laboratory/arui-presets-lint/commit/077b698))
- add ts example ([dd2c8b0](https://github.com/alfa-laboratory/arui-presets-lint/commit/dd2c8b0))
- new configuration, add prettier instructions ([3e0fa81](https://github.com/alfa-laboratory/arui-presets-lint/commit/3e0fa81))
- use prettier instead of prettier-eslint ([b954d26](https://github.com/alfa-laboratory/arui-presets-lint/commit/b954d26))
- **eslint:** add warn rules for formatting ([921947d](https://github.com/alfa-laboratory/arui-presets-lint/commit/921947d))

<a name="3.0.1"></a>

## [3.0.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v3.0.0...v3.0.1) (2020-02-12)

### Features

- remove jsx-one-expression-per-line ([edca46e](https://github.com/alfa-laboratory/arui-presets-lint/commit/edca46e))

<a name="3.0.0"></a>

# [3.0.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v2.0.1...v3.0.0) (2020-02-12)

### Bug Fixes

- **js-input:** fix eslint errors ([5b34d19](https://github.com/alfa-laboratory/arui-presets-lint/commit/5b34d19))

### Features

- **dependencies:** add eslint-plugin-react-hooks and extend rules. update plugin eslint ([4d73805](https://github.com/alfa-laboratory/arui-presets-lint/commit/4d73805))

<a name="2.0.1"></a>

## [2.0.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v2.0.0...v2.0.1) (2019-12-24)

### Bug Fixes

- **stylelint:** fix path to plugin, up plugin version ([e1ebf5e](https://github.com/alfa-laboratory/arui-presets-lint/commit/e1ebf5e))

<a name="2.0.0"></a>

# [2.0.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v1.2.1...v2.0.0) (2019-12-06)

<a name="1.2.1"></a>

## [1.2.1](https://github.com/alfa-laboratory/arui-presets-lint/compare/v1.1.0...v1.2.1) (2019-09-03)

### Bug Fixes

- **eslint:** disable multiline-comment-style rule ([65ea774](https://github.com/alfa-laboratory/arui-presets-lint/commit/65ea774))

### Features

- **stylelint:** use arui-cssvars ([2a2cc6e](https://github.com/alfa-laboratory/arui-presets-lint/commit/2a2cc6e))

<a name="1.2.0"></a>

# [1.2.0](https://github.com/alfa-laboratory/arui-presets-lint/compare/v1.1.0...v1.2.0) (2019-04-04)

### Features

- **stylelint:** use arui-cssvars ([2a2cc6e](https://github.com/alfa-laboratory/arui-presets-lint/commit/2a2cc6e))

<a name="1.1.0"></a>

# 1.1.0 (2019-03-13)

### Features

- **configuration:** add new stylistic rules ([d6500f6](https://github.com/alfa-laboratory/arui-presets-lint/commit/d6500f6))
