---
'arui-presets-lint': minor
---

## New Features

- Добавлено правило **`require-description`**, которое требует указания причины отключения ESLint‑директив.
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
- При отсутствии валидного описания правило выдаёт сообщение `missingDescription`; если описание присутствует, но не проходит проверки – `invalidDescription`.
