import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
    BEGIN_MARKER,
    END_MARKER,
    mergeBlock,
    syncAgentsMd,
} from '../cli/sync-agents.mjs';

const BLOCK = '# Lint rules\n\nDo the thing.';

describe('mergeBlock', () => {
    it('creates a marked block when existing content is empty', () => {
        const result = mergeBlock('', BLOCK);

        expect(result).toBe(`${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`);
    });

    it('treats whitespace-only content as empty', () => {
        expect(mergeBlock('   \n\t\n', BLOCK)).toBe(
            `${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`,
        );
    });

    it('appends the block with a leading blank line when no markers exist', () => {
        const existing = '# My project\n\nSome notes.\n';
        const result = mergeBlock(existing, BLOCK);

        expect(result).toBe(
            `# My project\n\nSome notes.\n\n${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`,
        );
    });

    it('replaces the region between markers and preserves surrounding content', () => {
        const existing = [
            '# Top',
            '',
            `${BEGIN_MARKER}`,
            'stale content',
            `${END_MARKER}`,
            '',
            '# Bottom',
            '',
        ].join('\n');

        const result = mergeBlock(existing, BLOCK);

        expect(result).toBe(
            `# Top\n\n${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n\n# Bottom\n`,
        );
    });

    it('is idempotent — re-merging its own output is byte-identical', () => {
        const once = mergeBlock('# Keep me\n', BLOCK);
        const twice = mergeBlock(once, BLOCK);

        expect(twice).toBe(once);
    });

    it('is idempotent when created from empty', () => {
        const once = mergeBlock('', BLOCK);
        const twice = mergeBlock(once, BLOCK);

        expect(twice).toBe(once);
    });

    it('appends when only the BEGIN marker is present (malformed)', () => {
        const existing = `# Doc\n\n${BEGIN_MARKER}\nno end here\n`;
        const result = mergeBlock(existing, BLOCK);

        expect(result.endsWith(`${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`)).toBe(true);
        expect(result.startsWith('# Doc')).toBe(true);
    });

    it('appends when only the END marker is present (malformed)', () => {
        const existing = `# Doc\n\n${END_MARKER}\n`;
        const result = mergeBlock(existing, BLOCK);

        expect(result.endsWith(`${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`)).toBe(true);
    });

    it('appends when markers are inverted (END before BEGIN)', () => {
        const existing = `${END_MARKER}\ntext\n${BEGIN_MARKER}\n`;
        const result = mergeBlock(existing, BLOCK);

        expect(result.endsWith(`${BEGIN_MARKER}\n${BLOCK}\n${END_MARKER}\n`)).toBe(true);
    });
});

describe('syncAgentsMd', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-agents-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    const agentsPath = () => path.join(tmpDir, 'AGENTS.md');

    it('creates AGENTS.md when missing', () => {
        const result = syncAgentsMd(tmpDir);

        expect(result.changed).toBe(true);
        expect(result.path).toBe(agentsPath());
        expect(fs.existsSync(agentsPath())).toBe(true);

        const content = fs.readFileSync(agentsPath(), 'utf8');

        expect(content).toContain(BEGIN_MARKER);
        expect(content).toContain(END_MARKER);
        expect(content).toContain('arui-presets-lint');
    });

    it('reports no change on a second run (idempotent write)', () => {
        syncAgentsMd(tmpDir);
        const before = fs.readFileSync(agentsPath(), 'utf8');

        const result = syncAgentsMd(tmpDir);
        const after = fs.readFileSync(agentsPath(), 'utf8');

        expect(result.changed).toBe(false);
        expect(after).toBe(before);
    });

    it('updates only the managed region, preserving user content', () => {
        const userContent = `# House docs\n\n${BEGIN_MARKER}\nold\n${END_MARKER}\n\n# Footer\n`;

        fs.writeFileSync(agentsPath(), userContent);

        const result = syncAgentsMd(tmpDir);
        const content = fs.readFileSync(agentsPath(), 'utf8');

        expect(result.changed).toBe(true);
        expect(content.startsWith('# House docs')).toBe(true);
        expect(content).toContain('# Footer');
        expect(content).not.toContain('\nold\n');
    });
});
