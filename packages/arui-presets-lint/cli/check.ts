import {
    buildInvocation,
    checkCommands,
    type Command,
    type Invocation,
    type Selection,
} from './commands.js';

export type CheckResult = {
    command: string;
    status: 'passed' | 'failed' | 'skipped';
    exitCode: number;
    stdout?: string;
    stderr?: string;
};
export type Execute = (invocation: Invocation) => Promise<Omit<CheckResult, 'command' | 'status'>>;
export type OnCheckStart = (command: Command, index: number, total: number) => void;

export async function runChecks(
    execute: Execute,
    selection?: Selection,
    onCheckStart?: OnCheckStart,
) {
    const results: CheckResult[] = [];

    for (const [index, command] of checkCommands.entries()) {
        const invocation = buildInvocation(command, [], selection);
        // В режиме --changed для команды может не оказаться подходящих файлов
        if (!invocation) {
            results.push({ command, status: 'skipped', exitCode: 0, stdout: '', stderr: '' });

            continue;
        }

        onCheckStart?.(command, index, checkCommands.length);

        // eslint-disable-next-line no-await-in-loop -- Линтеры запускаются последовательно, чтобы ограничить нагрузку и сохранить порядок вывода
        const result = await execute(invocation);

        results.push({
            command,
            status: result.exitCode === 0 ? 'passed' : 'failed',
            ...result,
        });
    }

    return {
        exitCode: results.some((result) => result.status === 'failed') ? 1 : 0,
        results,
    };
}
