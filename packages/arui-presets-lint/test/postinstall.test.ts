import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    OPT_OUT_ENV,
    readPackageName,
    runPostinstall,
    shouldRun,
} from '../cli/postinstall.mjs';
import { BEGIN_MARKER } from '../cli/sync-agents.mjs';

describe('shouldRun', () => {
    it('skips when INIT_CWD is unset', () => {
        expect(shouldRun({})).toBe(false);
    });

    it('skips when the opt-out env var is set', () => {
        expect(shouldRun({ INIT_CWD: '/tmp/app', [OPT_OUT_ENV]: '1' }, 'my-app')).toBe(false);
    });

    it('skips on our own package', () => {
        expect(shouldRun({ INIT_CWD: '/repo' }, 'arui-presets-lint')).toBe(false);
    });

    it('skips on our own monorepo root', () => {
        expect(shouldRun({ INIT_CWD: '/repo' }, 'arui-presets-lint-monorepo')).toBe(false);
    });

    it('runs for a normal consumer project', () => {
        expect(shouldRun({ INIT_CWD: '/tmp/app' }, 'my-app')).toBe(true);
    });

    it('runs when the target package name is unknown', () => {
        expect(shouldRun({ INIT_CWD: '/tmp/app' })).toBe(true);
    });
});

describe('readPackageName', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-pkg-'));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('reads the name from package.json', () => {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'my-app' }));

        expect(readPackageName(tmpDir)).toBe('my-app');
    });

    it('returns undefined when package.json is missing', () => {
        expect(readPackageName(tmpDir)).toBeUndefined();
    });

    it('returns undefined when package.json is malformed', () => {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), '{ not json');

        expect(readPackageName(tmpDir)).toBeUndefined();
    });
});

describe('runPostinstall', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-postinstall-'));
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        vi.restoreAllMocks();
    });

    const agentsPath = () => path.join(tmpDir, 'AGENTS.md');

    it('writes AGENTS.md and logs a notice for a consumer project', () => {
        fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'my-app' }));

        runPostinstall({ INIT_CWD: tmpDir });

        expect(fs.existsSync(agentsPath())).toBe(true);
        expect(fs.readFileSync(agentsPath(), 'utf8')).toContain(BEGIN_MARKER);
        expect(console.log).toHaveBeenCalledOnce();
    });

    it('does not log when nothing changed on a second run', () => {
        runPostinstall({ INIT_CWD: tmpDir });
        vi.mocked(console.log).mockClear();

        runPostinstall({ INIT_CWD: tmpDir });

        expect(console.log).not.toHaveBeenCalled();
    });

    it('does nothing when INIT_CWD is unset', () => {
        runPostinstall({});

        expect(fs.existsSync(agentsPath())).toBe(false);
    });

    it('does nothing when the opt-out env var is set', () => {
        runPostinstall({ INIT_CWD: tmpDir, [OPT_OUT_ENV]: '1' });

        expect(fs.existsSync(agentsPath())).toBe(false);
    });

    it('skips our own repo without writing', () => {
        fs.writeFileSync(
            path.join(tmpDir, 'package.json'),
            JSON.stringify({ name: 'arui-presets-lint' }),
        );

        runPostinstall({ INIT_CWD: tmpDir });

        expect(fs.existsSync(agentsPath())).toBe(false);
    });

    it('warns and never throws when the sync fails', () => {
        const filePath = path.join(tmpDir, 'not-a-dir');

        fs.writeFileSync(filePath, 'x');

        expect(() => runPostinstall({ INIT_CWD: filePath })).not.toThrow();
        expect(console.warn).toHaveBeenCalledOnce();
    });
});
