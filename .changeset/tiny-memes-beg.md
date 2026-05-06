---
'arui-presets-lint': patch
---

Для правила import-x/no-cycle задан maxDepth вместе с ignoreExternal, чтобы снизить время линта на больших графах импортов. В V9_MIGRATION_GUIDE описан компромисс и как переопределить правило в проекте
