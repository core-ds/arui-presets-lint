# Гид по миграции на arui-presets-lint@9

## Введение

Несмотря на большое количество изменений в этом релизе, мигрировать довольно просто - все нюансы ваших проектов скорее всего уже учтены внутри конфига. Но кое-какие правки руками сделать придется, начнем по шагам:

0. Собственно, обновить зависимость:

```bash
yarn add arui-presets-lint@latest
```

1. Удалить свойство `eslintConfig` из package.json, и создать в корне проекта файл `eslint.config.mts` со следующим содержимым:

```typescript
import { defineConfig } from 'arui-presets-lint/eslint/config';
import { eslintConfig } from 'arui-presets-lint/eslint';

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
        rules: {
            'cypress/no-unnecessary-waiting': 'off',
        },
    },
    // Тут лежат glob-паттерны файлов, которые нужно игнорировать в проекте. Возможно он вам не понадобится, так как глобальный игнор на основные файлы и папки уже настроен на уровне arui-presets-lint
    ignores: []
]);
```

^^ Тут мы добавляем eslint-plugin-cypress, и определяем кастомные правила на уровне проекта. Про новый формат конфига - подробности [тут](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects)

> если нужно использовать плагины и правила, которые не поддерживают eslint 9, можно использовать для их подключения утилиты из пакета [@eslint/compat](https://www.npmjs.com/package/@eslint/compat)

1. `tsconfig.eslint.json` и правила игнорирования

    Ранее мы использовали кастомный tsconfig.eslint.json, например для того чтобы включить eslint для файлов в корневой директории - с переходом на [typescript-eslint projectService](https://typescript-eslint.io/blog/project-service/#introducing-the-project-service) он больше не нужен. Используйте основной tsconfig.json, а те файлы которые туда нельзя добавить, добавьте с помощью опции languageOptions.parserOptions.projectService.allowDefaultProject. Учтите что папки добавлять нельзя, так как это аффектит на производительность. Пример такого конфига:

```typescript
import { eslintConfig } from 'arui-presets-lint/eslint';
import { defineConfig } from 'arui-presets-lint/eslint/config';

export default defineConfig(eslintConfig, [
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    // Это позволит eslint линтить все файлы в корневой директории проекта, даже если они не указаны в tsconfig.json
<<<<<<< HEAD
                    // Эта настройка уже включена в arui-presets-lint
=======
                    // Эти параметры уже включены по умолчанию
>>>>>>> 81096d806878cea833037b1c6b1945e7f8a5dc78
                    allowDefaultProject: ['*.js', '*.ts', '*.mjs', '*.mts', '*.cts', '*.cjs'],
                },
            },
        },
    },
]);
```

3. import >> import-x

    Нужно пробежаться по проекту и заменить подобные комментарии:
    // eslint-disable-next-line import/no-default-export на
    // eslint-disable-next-line import-x/no-default-export

<<<<<<< HEAD
    Так же все правила в конфиге которые начинаються на `import/` нужно заменить на `import/x`. Других изменений делать не нужно, новый плагин полностью совместим со старым.
=======
    Так же все правила в конфиге которые начинаються на `import/` нужно заменить на `import-x/`. Других изменений делать не нужно, новый плагин полностью совместим со старым.
>>>>>>> 81096d806878cea833037b1c6b1945e7f8a5dc78

4. Набор правил eslint изменился - но многие правятся с помощью автофикса. Сделаем это!

    ```bash
    yarn lint:fix
    ```

    Если вы заметили что откровенно "вредное" правило попало в набор, приходите сразу с пулл реквестом в https://github.com/core-ds/arui-presets-lint . Ваш вклад поможет сделать библиотеку лучше!
