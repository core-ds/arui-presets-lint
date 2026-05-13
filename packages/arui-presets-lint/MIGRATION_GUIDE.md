# Гид по миграции на arui-presets-lint@9/10 с 8

[Обновляетесь с 7 и более ранних на 8?](https://github.com/core-ds/arui-presets-lint/blob/v8.8.1/V8_MIGRATION_GUIDE.md)

## Введение

Несмотря на большое количество изменений в этом релизе, мигрировать довольно просто - все нюансы ваших проектов скорее всего уже учтены внутри конфига. Но кое-какие правки руками сделать придется, начнем по шагам:

0. Собственно, обновить зависимость:

```bash
yarn add arui-presets-lint@latest
```

1. Удалить свойство `eslintConfig` из package.json, и создать в корне проекта файл `eslint.config.mts` со следующим содержимым:

```typescript
import { defineConfig } from 'arui-presets-lint/eslint/config';
import { eslintConfig, CYPRESS_SCRIPTS_SCOPE } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig);
```

Если нужно добавить конфиги на уровне проекта, можно это сделать подобным образом:

```typescript
import pluginCypress from 'eslint-plugin-cypress';
import { defineConfig } from 'arui-presets-lint/eslint/config';
import { eslintConfig } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig, [
    pluginCypress.configs.recommended,
    {
        // Константы появились в arui-presets-lint@10.1.0, если у вас более ранняя - укажите текстом:
        // files: ['cypress/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mts,cts,mtsx,ctsx}']
        files: [CYPRESS_SCOPE],
        rules: {
            'cypress/no-unnecessary-waiting': 'off',
        },
    },
]);
```

^^ Тут мы добавляем eslint-plugin-cypress, и определяем кастомные правила на уровне проекта. Про новый формат конфига - подробности [тут](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects)

Не забывайте про директиву files, её нужно указывать обязательно, особенно если правило переопределяется (не выключается). Константы можно импортировать из arui-presets-lint, например:

```typescript
import { eslintConfig, TYPESCRIPT_SCRIPTS_SCOPE } from 'arui-presets-lint/eslint'
import { defineConfig } from 'arui-presets-lint/eslint/config';

export default defineConfig(eslintConfig, [
    {
        rules: {
            '@typescript-eslint/consistent-type-assertions': 'warning',
        }
        // Константы появились в arui-presets-lint@10.1.0, если у вас более ранняя - укажите текстом:
        // files: '**/*.{ts,tsx,mts,cts,mtsx,ctsx}',
        files: [TYPESCRIPT_SCRIPTS_SCOPE],
    },
]);
```

> если нужно использовать плагины и правила, которые не поддерживают eslint 9, можно использовать для их подключения утилиты из пакета [@eslint/compat](https://www.npmjs.com/package/@eslint/compat)

1. `tsconfig.eslint.json` и правила игнорирования

    Ранее мы использовали кастомный tsconfig.eslint.json, например для того чтобы включить eslint для файлов в корневой директории - с переходом на [typescript-eslint projectService](https://typescript-eslint.io/blog/project-service/#introducing-the-project-service) он больше не нужен. Используйте основной tsconfig.json, а те файлы которые туда нельзя добавить, добавьте с помощью опции languageOptions.parserOptions.projectService.allowDefaultProject. Учтите что папки добавлять нельзя, так как это аффектит на производительность. Пример такого конфига:

```typescript
import { eslintConfig, TYPESCRIPT_SCRIPTS_SCOPE } from 'arui-presets-lint/eslint';
import { defineConfig } from 'arui-presets-lint/eslint/config';

export default defineConfig(eslintConfig, [
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // Это позволит eslint линтить файлы, даже если они не указаны в tsconfig.json
                    // Обратите внимание, что включить '**' тут нельзя, влияет на производительность!
                    // https://typescript-eslint.io/packages/parser/#allowdefaultproject
                    // Конретно тут - разрешаем линтить все файлы с расширениями .ts, .mts и .cts в корневой директории проекта
                    allowDefaultProject: ['*.ts', '*.mts', '*.cts'],
                },
            },
        },
        files: [TYPESCRIPT_SCRIPTS_SCOPE],
    },
]);
```

Так же можно исключить этот файл через globalIgnores (не рекомендуется), подробнее в README.md

3. import >> import-x

    Нужно пробежаться по проекту и заменить подобные комментарии:
    // eslint-disable-next-line import/no-default-export на
    // eslint-disable-next-line import-x/no-default-export

    Так же все правила в конфиге которые начинаються на `import/` нужно заменить на `import-x/`. Других изменений делать не нужно, новый плагин полностью совместим со старым.

    **Производительность `import-x/no-cycle`.**
    Правило «дорогое»: оно обходит зависимости, чтобы найти путь обратно к текущему файлу.
    В пресете это задано в [`eslint/rules/imports.ts`](eslint/rules/imports.ts): по умолчанию включены **`ignoreExternal: true`** и **`maxDepth: 20`** (см. [документацию правила](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-cycle.md)). Циклы длиннее этого порога ESLint не сообщит.
    Если необходима проверка без ограничения глубины или другое значение, то переопределите правило в своём `eslint.config.mts`:

    ```typescript
    import { GLOBAL_SCRIPTS_SCOPE } from 'arui-presets-lint/eslint'

    {
        rules: {
            'import-x/no-cycle': ['error', { ignoreExternal: true, maxDepth: 50 }],
            // или полная проверка без maxDepth (может сильно увеличить время линта):
            // 'import-x/no-cycle': ['error', { ignoreExternal: true }],
            // или отключить правило:
            // 'import-x/no-cycle': 'off',
        },
        // files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mts,cts,mtsx,ctsx}']
        files: [GLOBAL_SCRIPTS_SCOPE]
    },
    ```

4. Набор правил eslint изменился - но многие правятся с помощью автофикса. Сделаем это!

    ```bash
    yarn lint:fix
    ```

    Если вы заметили что откровенно "вредное" правило попало в набор, приходите сразу с пулл реквестом в https://github.com/core-ds/arui-presets-lint . Ваш вклад поможет сделать библиотеку лучше!
