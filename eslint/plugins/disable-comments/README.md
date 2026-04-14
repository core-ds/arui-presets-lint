Набор правил ESLint для контроля комментариев отключенных комментариев.
Плагин проверяет, что отключенный комментарий ESLint правила сопровождается описанием, что позволяет поддерживать чистоту кода и облегчает аудит.

### Config

Пакет экспортирует готовую конфигурацию ESLint.

Если вам нужен только сам плагин или отдельные правила, их можно импортировать из соответствующих подпапок:
```js
// Импорт плагина
import { disableCommentsPlugin } from 'arui-presets-lint/eslint/plugins';

// Импорт правила
import { requireDescriptionRule } from 'arui-presets-lint/eslint/plugins/disable-comments/rule';

export default [
  {
    plugins: {
      'disable-comments': disableCommentsPlugin,
    },
    rules: {
      'disable-comments/require-description': 'warn',
    },
  },
];
```

### Переопределение правил

Если требуется изменить уровень или параметры правила, добавьте собственный объект конфигурации после импорта готового конфига:

```js
import { disableCommentsConfig } from 'arui-presets-lint/eslint/plugins';

export default [
  disableCommentsConfig,
  {
    rules: {
      // Переключаем предупреждение в ошибку и задаём список директив, которые можно не сопровождать описанием
      'disable-comments/require-description': [
        'error',
        { ignore: ['eslint-env'] },
      ],
    },
  },
];
```

### Список правил

| Правило                                 | Описание                                                                 | По умолчанию |
|----------------------------------------|--------------------------------------------------------------------------|--------------|
| `disable-comments/require-description` | Требует наличие описания после любого комментария `eslint`, `eslint-disable`, `eslint-disable-next-line`, `eslint-disable-line`, `eslint-enable`, `eslint-env` | `warn` |

#### Параметры правила `disable-comments/require-description`

- **ignore** *(массив строк)* – список директив ESLint, для которых допускается отсутствие описания. <br/>Допустимые значения:
  - `eslint`
  - `eslint-disable`
  - `eslint-disable-line`
  - `eslint-disable-next-line`
  - `eslint-enable`
  - `eslint-env`

#### Пример конфигурации

```js
{
  "rules": {
    "disable-comments/require-description": [
      "error",
      { "ignore": ["eslint-env", "eslint"] }
    ]
  }
}
```

### Примеры
- Описание может быть указано **двумя способами**:
    1. **Встроенно в тот же комментарий** через сепаратор `--`
        ```ts
        // eslint-disable-next-line no-empty, no-constant-condition -- объяснение необходимости
        /* eslint-disable no-empty, no-constant-condition -- объяснение необходимости */
        ```
    2. **Отдельным надстрочным комментарии**, расположенным непосредственно перед директивой

        ```ts
        // Причина отключения правила
        // eslint-disable-next-line no-empty, no-constant-condition

        /* Причина отключения правила */
        /* eslint-disable no-empty, no-constant-condition */

        /*
         * Развернутое объяснение
         * и причины отключения
         */
        /* eslint-disable no-empty, no-constant-condition */
        ```

- В обоих случаях текст описания проходит проверку:
    - не состоит только из пробелов или пунктуации;
    - содержит «осмысленный» фрагмент (буквы или цифры).

### Сообщения и предложения (suggestions)

| messageId                                 | Текст сообщения                                                                 |
|----------------------------------------|--------------------------------------------------------------------------|
| `missingDescription` | Директива ESLint без описания. Добавьте описание после -- или комментарий над директивой. |
| `invalidDescription` | Описание слишком общее или неинформативное. Укажите конкретную причину. |
| `suggestDebug` | 	Добавить комментарий — "Используется временно для отладки" |
| `suggestAboveComment` | Добавить задачу — "TODO: [ссылка на задачу] Описание" |

#### Автоматические исправления
- `createSuggestionFix` – добавляет описание после разделителя --.
- `createAboveCommentFix` – вставляет отдельный комментарий над директивой.

Эти исправления доступны через eslint --fix и через меню «Suggest» в IDE, поддерживающих ESLint‑suggestions.
