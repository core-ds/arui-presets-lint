import { execaCommand, ExecaError } from 'execa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const prettierParams =
    '"./**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json,mjsx,cjsx,mtsx,ctsx}" --no-error-on-unmatched-pattern --cache';
const cacheFolder = './node_modules/.cache';

const commandsMap = {
    styles: `stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore --cache --cache-location="${cacheFolder}/stylelint/.stylelintcache"`,
    scripts: 'eslint .',
    format: `prettier --experimental-cli --write ${prettierParams}`,
    'format:check': `prettier --experimental-cli --check ${prettierParams}`,
    knip: `knip --no-config-hints --cache --cache-location="${cacheFolder}/knip"`,
    secretlint: `secretlint "**/*"`,
} as const;

/**
 * secretlint на каждый файл пишет метки User Timing API, а его профайлер на каждую метку
 * линейно сканирует все предыдущие - время прогона растёт квадратично от числа файлов
 * (5000 файлов - около 200 секунд, из которых на сам поиск секретов уходит меньше секунды).
 * Профайлер нужен только для флага --profile, поэтому в дочернем процессе отключаем
 * User Timing API целиком: тот же прогон укладывается в секунду.
 * https://github.com/secretlint/secretlint/blob/master/packages/%40secretlint/profiler/src/index.ts
 *
 * TODO: https://github.com/secretlint/secretlint/issues/1633 - баг заведён в апстриме
 * (на момент 13.0.4 не починен, PR нет). Когда профайлер начнут включать только по флагу -
 * убрать эту константу и передачу NODE_OPTIONS ниже.
 */
const disableUserTiming = `--import=data:text/javascript,${encodeURIComponent(
    'performance.mark = () => undefined; performance.measure = () => undefined;',
)}`;

/** Commands recognized by the CLI, including the non-execa `agents` sync. */
export const commands = [...Object.keys(commandsMap), 'agents'];

export type ParsedInvocation = {
    enableEcho: boolean;
    command?: string;
    args: string[];
};

/**
 * Parses the CLI argv tail (everything after `node cli/index.mjs`), extracting
 * the optional leading `--echo` flag, the command and the remaining args.
 */
export function parseInvocation(argv: string[]): ParsedInvocation {
    const enableEcho = argv[0] === '--echo';
    const command = enableEcho ? argv[1] : argv[0];
    const args = enableEcho ? argv.slice(2) : argv.slice(1);

    return { enableEcho, command, args };
}

/**
 * Runs a single CLI invocation. `agents` is dispatched to the dependency-free
 * sync module (before the execa path); every other command is executed as a
 * shell string via execa. Unknown/missing commands print usage and exit.
 */
export async function run(argv: string[]): Promise<void> {
    const { enableEcho, command, args } = parseInvocation(argv);

    if (!command || !commands.includes(command)) {
        console.error(`Please specify one of available commands: ${commands.join(' ')}`);

        process.exit(-1);
    }

    if (command === 'agents') {
        const { syncAgentsMd } = await import('./sync-agents.mjs');
        const { changed, path: agentsPath } = syncAgentsMd(process.cwd());

        console.log(
            `arui-presets-lint: AGENTS.md ${changed ? 'updated' : 'already up to date'} (${agentsPath})`,
        );

        process.exit(0);
    }

    const exec = [commandsMap[command as keyof typeof commandsMap], ...args].join(' ');

    // --profile у secretlint как раз печатает замеры профайлера, для него метки нужно оставить
    const env =
        command === 'secretlint' && !args.includes('--profile')
            ? {
                  NODE_OPTIONS: [process.env.NODE_OPTIONS, disableUserTiming]
                      .filter(Boolean)
                      .join(' '),
              }
            : {};

    if (enableEcho) {
        console.log('>>', exec);
    }

    try {
        await execaCommand(exec, {
            shell: true,
            preferLocal: true,
            localDir: packageRoot,
            stdio: ['pipe', 'inherit', 'inherit'],
            env,
        });
    } catch (error: unknown) {
        if (error instanceof ExecaError) {
            console.error(error.message);
            process.exit(error.exitCode);
        } else {
            console.error('Unknown error');
            process.exit(1);
        }
    }
}
