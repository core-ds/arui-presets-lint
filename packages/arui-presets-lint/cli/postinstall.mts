import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { syncAgentsMd } from './sync-agents.mjs';

export const OPT_OUT_ENV = 'ARUI_PRESETS_LINT_SKIP_AGENTS';

/**
 * Package names identifying our own package / monorepo root. Running the sync
 * against these would rewrite this repo's own AGENTS.md during local dev/CI
 * installs, so we skip them.
 */
export const SELF_PACKAGE_NAMES = ['arui-presets-lint', 'arui-presets-lint-monorepo'];

export type PostinstallEnv = {
    INIT_CWD?: string;
    ARUI_PRESETS_LINT_SKIP_AGENTS?: string;
};

/**
 * Pure decision helper: should the postinstall sync run?
 *
 * - Skips when the opt-out env var is set (to any non-empty value).
 * - Skips when `INIT_CWD` is unset (no consumer root to target).
 * - Skips when the target package is our own package/monorepo.
 */
export function shouldRun(env: PostinstallEnv, targetPkgName?: string): boolean {
    if (env[OPT_OUT_ENV]) {
        return false;
    }

    if (!env.INIT_CWD) {
        return false;
    }

    if (targetPkgName !== undefined && SELF_PACKAGE_NAMES.includes(targetPkgName)) {
        return false;
    }

    return true;
}

/**
 * Reads the `name` field of `<projectRoot>/package.json`, returning `undefined`
 * when the file is absent, unreadable or malformed.
 */
export function readPackageName(projectRoot: string): string | undefined {
    try {
        const pkgPath = path.join(projectRoot, 'package.json');
        const raw = fs.readFileSync(pkgPath, 'utf8');

        return JSON.parse(raw).name;
    } catch {
        return undefined;
    }
}

/**
 * Never-throwing postinstall entry: syncs the lint block into the consumer's
 * AGENTS.md when the guards allow, printing a concise notice on write. On any
 * failure it prints a warning and returns without throwing, so a consumer's
 * install never breaks.
 */
export function runPostinstall(env: PostinstallEnv): void {
    try {
        const projectRoot = env.INIT_CWD;
        const targetPkgName = projectRoot ? readPackageName(projectRoot) : undefined;

        if (!shouldRun(env, targetPkgName) || !projectRoot) {
            return;
        }

        const { changed, path: agentsPath } = syncAgentsMd(projectRoot);

        if (changed) {
            console.log(`arui-presets-lint: updated ${agentsPath}`);
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);

        console.warn(`arui-presets-lint: skipped AGENTS.md sync (${message})`);
    }
}

/* istanbul ignore next -- only runs when invoked directly as the install hook */
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runPostinstall(process.env);
}
