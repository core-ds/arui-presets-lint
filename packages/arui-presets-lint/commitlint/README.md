# commitlint

Базовый конфиг: `@commitlint/config-conventional` + обязательный `scope` и лимит длины body.

## Подключение

```js
// commitlint.config.mjs
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default {
    extends: [require.resolve('arui-presets-lint/commitlint')],
};
```
