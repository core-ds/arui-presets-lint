import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const syncAgentsMd = vi.fn();
const execaCommand = vi.fn();

class ExecaError extends Error {
    exitCode = 2;
}

vi.mock('../cli/sync-agents.mjs', () => ({
    syncAgentsMd,
    BEGIN_MARKER: '<!-- BEGIN arui-presets-lint -->',
    END_MARKER: '<!-- END arui-presets-lint -->',
}));

vi.mock('execa', () => ({ execaCommand, ExecaError }));

const { commands, parseInvocation, run } = await import('../cli/commands.mjs');

describe('parseInvocation', () => {
    it('parses a bare command with args', () => {
        expect(parseInvocation(['scripts', '--fix'])).toEqual({
            enableEcho: false,
            command: 'scripts',
            args: ['--fix'],
        });
    });

    it('parses the --echo flag ahead of the command', () => {
        expect(parseInvocation(['--echo', 'agents', 'foo'])).toEqual({
            enableEcho: true,
            command: 'agents',
            args: ['foo'],
        });
    });

    it('reports no command for empty argv', () => {
        expect(parseInvocation([])).toEqual({ enableEcho: false, command: undefined, args: [] });
    });
});

describe('commands', () => {
    it('includes the existing execa commands', () => {
        expect(commands).toEqual(
            expect.arrayContaining(['styles', 'scripts', 'format', 'format:check']),
        );
    });

    it('recognizes the agents command', () => {
        expect(commands).toContain('agents');
    });

    it('includes the knip and secretlint commands', () => {
        expect(commands).toEqual(expect.arrayContaining(['knip', 'secretlint']));
    });
});

describe('run', () => {
    beforeEach(() => {
        vi.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`exit:${code}`);
        });
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        syncAgentsMd.mockReset();
        execaCommand.mockReset();
    });

    it('dispatches the agents command to syncAgentsMd and exits 0', async () => {
        syncAgentsMd.mockReturnValue({ changed: true, path: '/tmp/app/AGENTS.md' });

        await expect(run(['agents'])).rejects.toThrow('exit:0');

        expect(syncAgentsMd).toHaveBeenCalledWith(process.cwd());
        expect(execaCommand).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledOnce();
    });

    it('dispatches agents even with a leading --echo flag', async () => {
        syncAgentsMd.mockReturnValue({ changed: false, path: '/tmp/app/AGENTS.md' });

        await expect(run(['--echo', 'agents'])).rejects.toThrow('exit:0');

        expect(syncAgentsMd).toHaveBeenCalledWith(process.cwd());
    });

    it('errors and exits with -1 on an unknown command', async () => {
        await expect(run(['bogus'])).rejects.toThrow('exit:-1');

        expect(console.error).toHaveBeenCalledOnce();
        expect(execaCommand).not.toHaveBeenCalled();
        expect(syncAgentsMd).not.toHaveBeenCalled();
    });

    it('errors and exits with -1 when no command is given', async () => {
        await expect(run([])).rejects.toThrow('exit:-1');

        expect(console.error).toHaveBeenCalledOnce();
    });

    it('runs a known command through execa with its args', async () => {
        execaCommand.mockResolvedValue({});

        await run(['scripts', '--fix']);

        expect(execaCommand).toHaveBeenCalledOnce();
        expect(execaCommand.mock.calls[0][0]).toBe('eslint . --fix');
    });

    it('passes an empty env for non-secretlint commands', async () => {
        execaCommand.mockResolvedValue({});

        await run(['scripts']);

        expect(execaCommand.mock.calls[0][1].env).toEqual({});
    });

    it('disables the secretlint profiler via NODE_OPTIONS', async () => {
        execaCommand.mockResolvedValue({});

        await run(['secretlint']);

        expect(execaCommand.mock.calls[0][0]).toBe('secretlint "**/*"');
        expect(execaCommand.mock.calls[0][1].env.NODE_OPTIONS).toContain(
            '--import=data:text/javascript,',
        );
    });

    it('keeps the secretlint profiler enabled when --profile is passed', async () => {
        execaCommand.mockResolvedValue({});

        await run(['secretlint', '--profile']);

        expect(execaCommand.mock.calls[0][1].env).toEqual({});
    });

    it('echoes the resolved command when --echo is passed', async () => {
        execaCommand.mockResolvedValue({});

        await run(['--echo', 'scripts']);

        expect(console.log).toHaveBeenCalledWith('>>', 'eslint .');
        expect(execaCommand).toHaveBeenCalledOnce();
    });

    it('reports the exit code from an ExecaError', async () => {
        execaCommand.mockRejectedValue(new ExecaError('boom'));

        await expect(run(['scripts'])).rejects.toThrow('exit:2');

        expect(console.error).toHaveBeenCalledWith('boom');
    });

    it('reports a generic failure for a non-ExecaError', async () => {
        execaCommand.mockRejectedValue(new Error('nope'));

        await expect(run(['scripts'])).rejects.toThrow('exit:1');

        expect(console.error).toHaveBeenCalledWith('Unknown error');
    });
});
