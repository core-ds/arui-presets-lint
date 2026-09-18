import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const BEGIN_MARKER = '<!-- BEGIN arui-presets-lint -->';
export const END_MARKER = '<!-- END arui-presets-lint -->';

export type SyncResult = {
    changed: boolean;
    path: string;
};

/**
 * Merges the managed lint-rules `block` into `existing` AGENTS.md content.
 *
 * - When both markers are present (and well-formed), the region between them is
 *   replaced, preserving any user content before/after.
 * - When markers are absent (or malformed/half-present), the block is appended
 *   with a leading blank line.
 * - When `existing` is empty/whitespace, the block becomes the whole file.
 */
export function mergeBlock(existing: string, block: string): string {
    const wrapped = `${BEGIN_MARKER}\n${block.trim()}\n${END_MARKER}`;

    if (existing.trim() === '') {
        return `${wrapped}\n`;
    }

    const beginIndex = existing.indexOf(BEGIN_MARKER);
    const endIndex = existing.indexOf(END_MARKER);

    if (beginIndex !== -1 && endIndex > beginIndex) {
        const before = existing.slice(0, beginIndex);
        const after = existing.slice(endIndex + END_MARKER.length);

        return `${before}${wrapped}${after}`;
    }

    const trimmedExisting = existing.replace(/\s+$/, '');

    return `${trimmedExisting}\n\n${wrapped}\n`;
}

/**
 * Syncs the shipped lint-rules block into `<projectRoot>/AGENTS.md`.
 *
 * Reads the block relative to this module (`../agents/lint-block.md`, which
 * resolves from the published `dist/cli/sync-agents.mjs`), merges it into the
 * project's AGENTS.md and writes only when the content actually changed.
 */
export function syncAgentsMd(projectRoot: string): SyncResult {
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    const blockPath = path.resolve(moduleDir, '../agents/lint-block.md');
    const block = fs.readFileSync(blockPath, 'utf8');

    const agentsPath = path.join(projectRoot, 'AGENTS.md');
    const existing = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';

    const merged = mergeBlock(existing, block);

    if (merged === existing) {
        return { changed: false, path: agentsPath };
    }

    fs.writeFileSync(agentsPath, merged);

    return { changed: true, path: agentsPath };
}
