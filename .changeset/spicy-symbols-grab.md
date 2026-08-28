
---
'arui-presets-lint': patch
---

В dist `exports` для subpath (в том числе `arui-presets-lint/commitlint`) добавлено условие `default`, чтобы CJS-резолверы (`require.resolve`, `resolve-from`) находили модуль