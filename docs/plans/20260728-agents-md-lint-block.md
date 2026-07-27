# Ship a lint-standards block into consumers' AGENTS.md on postinstall

GitHub issue: https://github.com/core-ds/arui-presets-lint/issues/111 ("Shared AI skills")

## Overview

`arui-presets-lint` provides shared ESLint/Stylelint/Prettier configs to ~1000 internal Alfa-Bank projects. AI coding agents (Cursor, Copilot, Claude Code, …) don't read the ESLint config, so they repeatedly write code that violates house rules — wrong import-group order, `import { isEqual } from 'lodash'`, hardcoded colors instead of design-system tokens, `PropsWithChildren`, etc. LSP + lefthook catch these *after* the fact, but agents keep re-introducing them.

This change ships a single consolidated, English lint-rules block that is merged into each project's `AGENTS.md` automatically on `postinstall`, so any agent that reads `AGENTS.md` follows the house rules up front. The same logic is exposed as an explicit CLI subcommand (`arui-presets-lint agents`) for manual re-runs and `--ignore-scripts` environments.

**Key benefit**: agents produce lint-clean code on the first pass, reducing fix churn across ~1000 repos, with zero external tooling and a safe, idempotent, opt-out-able install hook.

**Decisions locked in** (from planning): (1) an `AGENTS.md` block, *not* a `skills/` folder; (2) auto-copy via a `postinstall` hook + a manual CLI command; (3) content in English.

## Context (from discovery)

- Files/components involved:
  - `packages/arui-presets-lint/cli/index.mts` — thin execa-based CLI; `commandsMap` maps command → shell string; supports `--echo`. `bin` = `cli/index.mjs`.
  - `packages/arui-presets-lint/_internal/build-dist-package.ts` — generates `dist/package.json` by spreading `...sourcePkg`, rewriting `exports`, resolving `workspace:*`, blanking `devDependencies`.
  - `packages/arui-presets-lint/package.json` — `build` runs `tsc` then `copyfiles 'lefthook/*.yml' '**/*.md' dist` (so any `**/*.md` ships automatically), then the dist-package build. No existing lifecycle hooks. Publishes from `dist/` (`publishConfig.directory`).
  - Rule sources for block content: `eslint/rules/imports.ts` (import order groups L238-249; lodash ban L254-272; inline type specifier L227), `eslint/rules/best-practices.ts` (`PropsWithChildren` ban L145-148; `no-plusplus` L123; `prefer-template`, `no-nested-ternary`, `no-param-reassign`), `eslint/rules/react.ts`, `eslint/rules/typescript.ts`, `stylelint/index.ts` (`@alfalab/stylelint-core-vars` rules), `prettier/index.js` (100/4-space/single-quote/trailing-all), custom `eslint/plugins/disable-comments` (require-description).
- Related patterns found: CLI commands run via execa shell strings; vitest tests live in `test/`; `turbo.jsonc` `outputs: dist/**` + `$TURBO_DEFAULT$` inputs need no change.
- Dependencies identified: sync/postinstall code must use **only** `node:fs`/`node:path`/`node:url` (runtime-only, safe in postinstall; `execa`/`tsx` are dev/dist-stripped and unavailable at consumer install time).
- Cleanup: 5 empty untracked scaffolding dirs `packages/arui-presets-lint/skills/*` (`code-quality`, `css-variables`, `imports-style`, `react-patterns`, `typescript-standards`) from the abandoned skills approach — remove them.

## Development Approach

- **Testing approach**: Regular (code first, then tests) — but the core `mergeBlock` logic is pure and must be unit-tested within its task before proceeding.
- Complete each task fully before moving to the next; small, focused changes.
- **Every task includes new/updated tests** for its code changes (success + error/edge cases).
- **All tests must pass before starting the next task.**
- New `.mts` files must lint clean under the package's own ESLint (kebab-case filenames, correct import-group order) — the package lints itself as part of `yarn test`.
- Maintain backward compatibility: the CLI keeps all existing commands; source `package.json` gets no `postinstall` (hook is injected only into the published manifest).

## Testing Strategy

- **Unit tests** (vitest, in `packages/arui-presets-lint/test/`): required for `mergeBlock` (create/append/replace/idempotent/preserve) and for `syncAgentsMd` behavior via a temp dir.
- **E2E / manual**: postinstall simulation against a throwaway project dir (see Post-Completion) — not automated in CI, documented for manual verification.
- Treat the package's existing `yarn test` gate (tsc, prettier-conflict check, duplicates-checker, self-lint, vitest+coverage) as the pass bar for every task.

## Progress Tracking

- Mark completed items `[x]` immediately when done.
- Add newly discovered tasks with ➕ prefix; blockers with ⚠️ prefix.
- Keep this plan in sync with actual work.

## Implementation Steps

### Task 1: Author the English lint-rules block
- [x] create `packages/arui-presets-lint/agents/lint-block.md` with curated English sections, each grounded in the real config: Imports & ordering (7 groups: node builtins → react/redux/externals → `@alfalab/*` + arui-feather/arui-private → `#` aliases → parent `../` → sibling `./` → `*.css`/`*.scss`; blank line between groups)
- [x] add lodash section (`import isEqual from 'lodash/isEqual'`, never `import { isEqual } from 'lodash'` or `lodash.*`) and inline type-imports section (`import { type Foo, bar } from '...'`)
- [x] add CSS/design-token section (`var(--color-light-...)`, gap/shadow/border-radius tokens, typography `@mixin`s; never `--color-dark-*` directly)
- [x] add React section (`PropsWithChildren` → `children?: ReactNode`; React in scope; no array-index `key`; `<button type>`; self-closing; explicit boolean prop; no redundant JSX curlies; exhaustive-deps), TypeScript section (naming conventions; no floating promises; `array-simple`), General section (no `++`/`--`; prefer template literals; no nested ternaries; no param reassignment; kebab-case files/folders), Formatting section (printWidth 100, 4-space, single quotes incl. JSX, trailing comma all), and `eslint-disable`-needs-description note
- [x] verify the file is valid CommonMark and passes the package's own markdown lint / prettier (self-lint runs in `yarn test`)
- [x] run `yarn lint` in the package - must pass before Task 2

### Task 2: Implement the merge/sync module
- [x] create `packages/arui-presets-lint/cli/sync-agents.mts` using only `node:fs`/`node:path`/`node:url`
- [x] implement `mergeBlock(existing, block)` with markers `<!-- BEGIN arui-presets-lint -->` … `<!-- END arui-presets-lint -->`: replace region when markers present; append (with leading blank line) when absent; block becomes whole file when empty/missing
- [x] implement `syncAgentsMd(projectRoot)` → `{ changed, path }`: read shipped block via `fileURLToPath(import.meta.url)` (`../agents/lint-block.md` relative to compiled `cli/sync-agents.mjs`), read/create `<projectRoot>/AGENTS.md`, apply `mergeBlock`, write **only if content changed**
- [x] write tests for `mergeBlock`: create-from-empty, append-when-no-markers, replace-between-markers, preserves surrounding user content (success cases)
- [x] write tests for idempotency (same input → byte-identical output) and edge cases (block already current → `changed: false`; malformed/half markers)
- [x] add `packages/arui-presets-lint/test/sync-agents.test.ts` and run `yarn vitest run test/sync-agents.test.ts` - must pass before Task 3

### Task 3: Add the guarded postinstall entry
- [x] create `packages/arui-presets-lint/cli/postinstall.mts` — thin, never-throwing wrapper around `syncAgentsMd`
- [x] resolve consumer root from `process.env.INIT_CWD`; bail if unset
- [x] bail when target is our own package/monorepo (target `package.json` `name === 'arui-presets-lint'` or workspace root) to avoid self-modification in local dev/CI
- [x] add opt-out via `process.env.ARUI_PRESETS_LINT_SKIP_AGENTS`; wrap everything in `try/catch`, print a concise notice on write, print a warning and exit 0 on error
- [x] write tests for the guard/decision logic (extract a pure `shouldRun(env, targetPkgName)` helper so guards are unit-testable without spawning installs): skip when no `INIT_CWD`, skip on self-repo, skip when opt-out set, run otherwise
- [x] run `yarn vitest run` - must pass before Task 4

### Task 4: Wire the CLI subcommand
- [x] extend `packages/arui-presets-lint/cli/index.mts`: add `agents` to the recognized-commands list; branch **before** the execa path so `agents` runs `syncAgentsMd(process.cwd())` via `await import('./sync-agents.mjs')`, logs the `{ changed, path }` result, and `process.exit(0)` (logic extracted to `cli/commands.mts` — shebang `index.mts` can't hold exports under `unicorn/no-exports-in-scripts`; `index.mts` is now a thin bin that calls `run`)
- [x] preserve existing `--echo` handling and the usage/error message for unknown commands
- [x] write/extend a test asserting `agents` is accepted and dispatches to the sync path (and that unknown commands still error) — mock the sync module or assert on argv parsing (`test/commands.test.ts`, sync + execa modules mocked)
- [x] run `yarn vitest run` - must pass before Task 5

### Task 5: Inject the postinstall hook into the published manifest
- [ ] edit `packages/arui-presets-lint/_internal/build-dist-package.ts` so `distPkg.scripts` is a minimal published set containing `postinstall: 'node cli/postinstall.mjs'` (dist-root-relative, matching `bin`); do NOT add `postinstall` to the source `package.json`
- [ ] confirm no source scripts that reference stripped devDeps (tsx/rimraf/copyfiles) leak into the published manifest in a way that could break consumer installs
- [ ] write/adjust a check (unit test or extend `_internal` assertions) verifying the generated `dist/package.json` contains the `postinstall` entry and the block ships — or cover via the build verification in Task 6
- [ ] run `yarn build` and inspect `dist/package.json` + `dist/agents/lint-block.md` + `dist/cli/{sync-agents,postinstall}.mjs`
- [ ] run `yarn test` (full package gate) - must pass before Task 6

### Task 6: Cleanup, docs, changeset
- [ ] remove the 5 empty `packages/arui-presets-lint/skills/*` scaffolding dirs
- [ ] add a README (Russian) section: what the AGENTS.md sync does, the `ARUI_PRESETS_LINT_SKIP_AGENTS` opt-out, and the manual `arui-presets-lint agents` command
- [ ] add a changeset (`minor`) via `yarn changeset` describing the feature
- [ ] run `yarn test` - must pass before Task 7

### Task 7: Verify acceptance criteria
- [ ] verify all Overview requirements are implemented (block ships, postinstall in dist manifest only, CLI `agents` command works, opt-out + self-repo guards effective)
- [ ] run the full package test suite (`yarn test`) and confirm coverage meets the project standard
- [ ] run `yarn lint` - all issues fixed; confirm new `.mts` files lint clean
- [ ] run `yarn build` and re-confirm dist artifacts

### Task 8: [Final] Update documentation
- [ ] ensure README changes are complete and accurate
- [ ] note any new patterns (guarded postinstall + marker-merge) in repo docs if warranted

## Technical Details

- **Markers**: `<!-- BEGIN arui-presets-lint -->` / `<!-- END arui-presets-lint -->` delimit the managed region so user-authored `AGENTS.md` content is preserved and updates flow on version bumps.
- **Idempotency**: `syncAgentsMd` writes only when merged content differs from current, keeping git diffs quiet across reinstalls.
- **Path resolution**: block is read relative to `import.meta.url` (`../agents/lint-block.md`), which resolves correctly from the published `dist/cli/sync-agents.mjs`.
- **Dependency-free at install time**: postinstall/sync use only node builtins; `execa`/`tsx` are unavailable in consumer installs (dist strips devDeps).
- **Hook lives only in dist**: injected in `build-dist-package.ts`, never in source `package.json`, so local dev/CI of this repo is unaffected; consumers with `--ignore-scripts` use the manual `agents` command.

## Post-Completion
*Manual/external — no checkboxes.*

**Manual verification:**
- Postinstall simulation in the scratchpad (not the repo): create a throwaway project dir, run `INIT_CWD=/path/to/tmpproj node packages/arui-presets-lint/dist/cli/postinstall.mjs`; confirm `AGENTS.md` gets the marked block. Run again → byte-identical (idempotent). Edit surrounding text → only the marked region updates.
- CLI path: from the throwaway project, `node <pkg>/dist/cli/index.mjs agents` yields the same result.
- Self-repo guard: postinstall with `INIT_CWD` pointed at this monorepo is a no-op; `ARUI_PRESETS_LINT_SKIP_AGENTS=1` skips the write.

**External system updates:**
- Release requires merging the Changesets "Release PR" to publish; the postinstall hook only takes effect for consumers once the new version is published and installed.
- PR needs approval from 2/3 CODEOWNERS with no "request changes"; rule/behavior choices must be justified objectively.
- Communicate to consuming teams that installing/upgrading will create or update `AGENTS.md` (and how to opt out) to avoid surprise diffs.
