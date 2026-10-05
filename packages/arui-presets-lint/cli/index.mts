#!/usr/bin/env node

import { execa } from 'execa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getChangedSelection } from './changed.js';
import { type Execute, runChecks } from './check.js';
import { buildInvocation, type Command, commands, parseOptions } from './commands.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

const argv = process.argv.slice(2);

const echo = argv[0] === '--echo';

const checkLabels: Record<Command, string> = {
    scripts: 'ESLint',
    styles: 'Stylelint',
    format: 'Prettier',
    'format:check': 'Prettier',
    knip: 'Knip',
    secretlint: 'Secretlint',
};

if (echo) {
    argv.shift();
}

const command = argv.shift();

try {
    if (!command || (command !== 'check' && !commands.includes(command as Command))) {
        throw new Error(`Укажите команду: check ${commands.join(' ')}`);
    }

    const options = parseOptions(argv, command === 'check');
    const selection = options.changed ? await getChangedSelection(process.cwd()) : undefined;
    const execute: Execute = async (invocation) => {
        if (echo) {
            console.error('>>', invocation.executable, JSON.stringify(invocation.args));
        }

        const env =
            invocation.command === 'secretlint' && !invocation.args.includes('--profile')
                ? {
                      NODE_OPTIONS: [process.env.NODE_OPTIONS, disableUserTiming]
                          .filter(Boolean)
                          .join(' '),
                  }
                : {};

        try {
            const result = await execa(invocation.executable, invocation.args, {
                // Бинарники линтеров ищем от папки этого пакета вверх по node_modules/.bin, а не от cwd
                preferLocal: true,
                localDir: packageRoot,
                stdin: 'ignore',
                // В JSON режиме вывод инструментов собираем в отчет, иначе показываем как есть
                stdout: options.json ? 'pipe' : 'inherit',
                stderr: options.json ? 'pipe' : 'inherit',
                reject: false,
                env,
            });

            return {
                exitCode: result.exitCode ?? 1,
                ...(options.json ? { stdout: result.stdout, stderr: result.stderr } : {}),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (!options.json) {
                console.error(message);
            }

            return {
                exitCode: 1,
                ...(options.json ? { stderr: message } : {}),
            };
        }
    };

    if (command === 'check') {
        const report = await runChecks(
            execute,
            selection,
            options.json
                ? undefined
                : (checkCommand, index, total) => {
                      console.log(
                          `[${index + 1}/${total}] ⏳ Проверка ${checkLabels[checkCommand]}...`,
                      );
                  },
        );
        if (options.json) {
            console.log(
                JSON.stringify(
                    { ...report, changed: options.changed, full: selection?.full ?? true },
                    null,
                    2,
                ),
            );
        } else {
            if (selection?.full) {
                console.log('Изменена конфигурация или удалены файлы: полный прогон.');
            }

            console.log('\nРезультаты проверок:');

            for (const result of report.results) {
                console.log(`${result.command}: ${result.status}`);
            }
        }
        process.exitCode = report.exitCode;
    } else {
        const invocation = buildInvocation(command as Command, options.forwarded, selection);

        if (invocation) {
            process.exitCode = (await execute(invocation)).exitCode;
        } else {
            console.log('Нет изменённых файлов для этой проверки.');
        }
    }
} catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // Даже ошибки выбора Git ref должны оставлять stdout машинно читаемым.
    // Смотрим в argv напрямую: parseOptions мог упасть раньше, чем вернул options.
    if (command === 'check' && argv.includes('--json')) {
        console.log(JSON.stringify({ exitCode: 1, error: message, results: [] }));
    } else {
        console.error(message);
    }

    process.exitCode = 1;
}
