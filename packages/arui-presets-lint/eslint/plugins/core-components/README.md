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

Конфиг `coreComponentsConfig` включает правило на уровне **`warn`**. Если требуется изменить уровень или параметры, добавьте собственный объект конфигурации после импорта готового конфига:

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
| `core-components/core-components-imports` | Требует использовать платформенные импорты (`desktop`/`mobile`) для компонентов core-components, у которых есть разделение на платформы | `warn` |

#### Параметры правила `core-components/core-components-imports`

- **splitComponents** *(массив строк)* – ручной список компонентов разделенных на платформы (имена компонентов, например `button`). Полностью заменяет автоопределение. Если не передан, список определяется автоматически.
- **excludeSplitComponents** *(массив строк)* – компоненты, которые нужно исключить из проверки (имена компонентов, например `button`, `alert`). Вычитается из итогового набора — как из переданного `splitComponents`, так и из автоопределения.

#### Пример конфигурации

```js
{
  "rules": {
    "core-components/core-components-imports": [
      "error",
      { "splitComponents": ["button"], "excludeSplitComponents": ["select"] }
    ]
  }
}
```

Наиболее частый случай — просто исключить один-два компонента, не переопределяя автоопределение. Для этого достаточно передать только `excludeSplitComponents`:

```js
{
  "rules": {
    "core-components/core-components-imports": [
      "error",
      { "excludeSplitComponents": ["universal-modal"] }
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

Динамический импорт проверяется аналогично статическому:

```ts
// ❌ Ошибка: у Button есть desktop/mobile разделение
const { Button } = await import('@alfalab/core-components/button');

// ✅ Через платформенный путь
const { ButtonDesktop } = await import('@alfalab/core-components/button/desktop');
```

Что остаётся валидным:

```ts
// ✅ Импорт корня агрегатора без компонента
import { setup } from '@alfalab/core-components';

// ✅ Посторонний пакет
import { Link } from 'some-lib';

// ✅ Компонент без разделения на платформы
import { Link } from '@alfalab/core-components/link';

// ✅ Импорт только типов — типы можно брать и с корня пакета
import type { ButtonProps } from '@alfalab/core-components/button';
import { type ButtonProps } from '@alfalab/core-components/button';

// ✅ Экспорт только типов
export type { ButtonProps } from '@alfalab/core-components/button';
export type * from '@alfalab/core-components/button';
```

Помимо обычного `import { X } from ...`, ошибку `missingPlatform` вызывают и другие рантайм-формы:

```ts
// ❌ Side-effect импорт
import '@alfalab/core-components/button';

// ❌ Export only значений
export { Button } from '@alfalab/core-components/button';
export * from '@alfalab/core-components/button';
export * as buttonNs from '@alfalab/core-components/button';

// ❌ Импорт с явным суффиксом /index
export * from '@alfalab/core-components/button/index';
```

### Сообщение об ошибке

Правило сообщает один `messageId` — `missingPlatform`, авто-фиксов нет: правку нужно делать вручную или через автоподстановку IDE.

| messageId      | Текст сообщения                                                                                                                              |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| `missingPlatform` | Компонент "{{component}}" имеет разделение на desktop/mobile. Используйте платформенный импорт "{{suggestedDesktop}}" или "{{suggestedMobile}}" вместо импорта с корня пакета. |
