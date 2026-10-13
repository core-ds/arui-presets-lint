---
'arui-presets-lint': patch
---

secretlint обновлён до 13.0.7, где профайлер больше не замедляет прогон — cli-обёртка не отключает User Timing API при запуске `arui-presets-lint secretlint`.
