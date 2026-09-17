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
| `core-components/core-components-imports` | Требует использовать платформенные импорты (`desktop`/`mobile`) для компонентов core-components, у которых есть разделение на платформы | `warn` |

> Конфиг `coreComponentsConfig` включает правило на уровне **`warn`** и применяет его к файлам, входящим в `GLOBAL_SCRIPTS_SCOPE`. Чтобы сделать его ошибкой сборки, переопределите уровень (см. ниже).

#### Параметры правила `core-components/core-components-imports`

- **splitComponents** *(массив строк)* – ручной список сплит-компонентов (имена компонентов, например `button`). Полностью заменяет автоопределение по установленной в `node_modules` версии `@alfalab/core-components`. Если не передан, список определяется автоматически в момент запуска.
- **excludeSplitComponents** *(массив строк)* – компоненты, которые нужно исключить из проверки (имена компонентов core-components, например `button`, `alert`). Вычитается из итогового набора — как из переданного `splitComponents`, так и из автоопределения.

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

### Как определяется список сплит-компонентов

По умолчанию правило автоматически находит сплит-компоненты по установленному пакету `@alfalab/core-components` из `node_modules` (относительно линтуемого файла). Компонент считается сплитнутым, если для каждой платформы (`desktop` и `mobile`) в его корне присутствует подкаталог (`desktop/`, `mobile/`) **либо** рантайм-файл с платформой-сегментом имени (`desktop.js`, `Component.desktop.js`, `Alert.desktop.js`).

Под платформенным сегментом понимается `desktop`/`mobile`, отделённый от остального имени точкой, дефисом или подчёркиванием, либо стоящий строго в начале/конце имени. Так, `Component.desktop.js` и `index.desktop.mjs` — это маркеры, а helper-файлы вроде `useIsDesktop.js` или `desktopify.js` — нет. Важно: файл-маркер обязан заканчиваться рантайм-расширением из `PLATFORM_FILE_EXTENSIONS` (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`).

Файлы объявлений типов (`.d.ts`, `.d.mts`, `.d.cts`) не учитываются — правило применяется только к рантайм-импортам. Автоопределение можно полностью заменить опцией `splitComponents`, а `excludeSplitComponents` позволяет вычесть отдельные компоненты из итогового набора.

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

Правило сообщает один `messageId` — `missingPlatform`. Авто-фиксов (suggestions) нет: правку нужно делать вручную или через автоподстановку IDE.

| messageId      | Текст сообщения                                                                                                                              |
|----------------|-------------------------------------------------------------------------------------------------------------------------------|
| `missingPlatform` | Компонент "{{component}}" имеет разделение на desktop/mobile. Используйте платформенный импорт "{{suggestedDesktop}}" или "{{suggestedMobile}}" вместо импорта с корня пакета. |

Для ошибочного импорта правило подставляет в сообщение актуальные платформенные пути под форму импорта: через агрегатор (`@alfalab/core-components/<pkg>/desktop`) или через отдельный подпакет (`@alfalab/core-components-<pkg>/desktop`).
