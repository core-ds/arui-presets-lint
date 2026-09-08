Набор правил ESLint для контроля импортов design-системы **core-components**.
Плагин требует использовать платформенные импорты (`desktop`/`mobile`) для компонентов, у которых есть разделение на платформы, и не даёт брать их с корня пакета.

### Config

Пакет экспортирует готовую конфигурацию ESLint.

```js
import { coreComponentsConfig } from 'arui-presets-lint/eslint/plugins';

export default [
  ...eslintConfig,
  coreComponentsConfig,
];
```

Если вам нужен только сам плагин или отдельное правило, их можно импортировать из соответствующих подпапок:
```js
// Импорт плагина
import { coreComponentsPlugin } from 'arui-presets-lint/eslint/plugins';

// Импорт правила
import { coreComponentsImportRule } from 'arui-presets-lint/eslint/plugins/core-components/rule';

export default [
  {
    plugins: {
      'core-components': coreComponentsPlugin,
    },
    rules: {
      'core-components/core-components-imports': 'error',
    },
  },
];
```

### Переопределение правил

Если требуется изменить уровень или параметры правила, добавьте собственный объект конфигурации после импорта готового конфига:

```js
import { coreComponentsConfig } from 'arui-presets-lint/eslint/plugins';

export default [
  coreComponentsConfig,
  {
    rules: {
      // Снижаем до предупреждения
      'core-components/core-components-imports': 'warn',
    },
  },
];
```

### Список правил

| Правило                                    | Описание                                                                                                                         | По умолчанию |
|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|--------------|
| `core-components/core-components-imports` | Требует использовать платформенные импорты (`desktop`/`mobile`) для компонентов core-components, у которых есть разделение на платформы | `error` |

#### Параметры правила `core-components/core-components-imports`

- **splitComponents** *(массив строк)* – список сплитнутых на платформы компонентов (имена подкаталогов, например `button`). Если параметр не передан, правило само определяет список по установленной в `node_modules` версии `@alfalab/core-components` в момент запуска.

#### Пример конфигурации

```js
{
  "rules": {
    "core-components/core-components-imports": [
      "error",
      { "splitComponents": ["button"] }
    ]
  }
}
```

### Примеры

Правило ругается на импорт **с корня пакета**, если у компонента есть разделение на платформы:

```ts
// ❌ Ошибка: у Button есть desktop/mobile разделение
import { Button } from '@alfalab/core-components/button';
```

Нужно использовать платформенный импорт. Поддерживаются обе формы:

```ts
// ✅ Через агрегатор
import { ButtonDesktop } from '@alfalab/core-components/button/desktop';
import { ButtonMobile } from '@alfalab/core-components/button/mobile';

// ✅ Через отдельный подпакет
import { ButtonDesktop } from '@alfalab/core-components-button/desktop';
import { ButtonMobile } from '@alfalab/core-components-button/mobile';
```

Что остаётся валидным:

```ts
// ✅ Импорт корня агрегатора без компонента
import { setup } from '@alfalab/core-components';

// ✅ Компонент без разделения на платформы
import { Link } from '@alfalab/core-components/link';

// ✅ Импорт только типов — типы можно брать и с корня пакета
import type { ButtonProps } from '@alfalab/core-components/button';
import { type ButtonProps } from '@alfalab/core-components/button';
```

### Сообщения и предложения (suggestions)

| messageId      | Текст сообщения                                                                                                                              |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| `missingPlatform` | Компонент "{{component}}" имеет разделение на desktop/mobile. Используйте платформенный импорт "{{suggestedDesktop}}" или "{{suggestedMobile}}" вместо импорта с корня пакета. |

Для ошибочного импорта правило подставляет в сообщение актуальные платформенные пути под форму импорта: через агрегатор (`@alfalab/core-components/<pkg>/desktop`) или через отдельный подпакет (`@alfalab/core-components-<pkg>/desktop`).
