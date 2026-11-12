# Проверка deprecated компонентов дизайн-системы

Правило `design-system/no-deprecated-components` предупреждает об использовании компонентов с `@deprecated`.

## Подключение

В `eslint.config.mts` подключите `createDesignSystemConfig` и передайте список пакетов в `deprecatedComponents.modules`.

```typescript
import { defineConfig, eslintConfig } from 'arui-presets-lint/eslint';
import { createDesignSystemConfig } from 'arui-presets-lint/eslint/plugins';

export default defineConfig(
    eslintConfig,
    createDesignSystemConfig({
        deprecatedComponents: {
            modules: ['@alfalab/core-components', 'arui-private'],
        },
    }),
);
```
