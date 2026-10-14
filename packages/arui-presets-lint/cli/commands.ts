export type Command = 'scripts' | 'styles' | 'format' | 'format:check' | 'knip' | 'secretlint';
export type Invocation = { command: Command; executable: string; args: string[] };
export type Selection = { files: string[]; full: boolean };

const formatExtensions = /\.(?:[cm]?jsx?|[cm]?tsx?|css|json)$/;
const cacheFolder = './node_modules/.cache';
const prettierPattern = './**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json,mjsx,cjsx,mtsx,ctsx}';

export const checkCommands: Command[] = ['scripts', 'styles', 'format:check', 'knip', 'secretlint'];
export const commands: Command[] = [...checkCommands, 'format'];

export function buildInvocation(
    command: Command,
    extraArgs: string[] = [],
    selection?: Selection,
): Invocation | undefined {
    const changedFiles = selection && !selection.full ? selection.files : undefined;
    const select = (matches: (file: string) => boolean, fallback: string) =>
        changedFiles ? changedFiles.filter(matches) : [fallback];
    // Аргументы до -- это флаги линтера, после -- пользовательские пути.
    const separator = extraArgs.indexOf('--');
    const flags = separator === -1 ? extraArgs : extraArgs.slice(0, separator);
    const literalPaths = separator === -1 ? [] : extraArgs.slice(separator + 1);
    let files: string[];

    switch (command) {
        case 'scripts':
            // eslint конфигурация использует check-file processor для YAML, HTML,
            // изображений и других файлов, поэтому передаем всю changed-выборку.
            // неподдерживаемые файлы безопасно пропускаются благодаря --no-warn-ignored.
            files = changedFiles ?? ['.'];

            return files.length
                ? {
                      command,
                      executable: 'eslint',
                      args: [
                          // Явно переданный файл из ignores иначе даёт warning и ломает --max-warnings=0.
                          ...(changedFiles ? ['--no-warn-ignored'] : []),
                          ...flags,
                          '--',
                          ...files,
                          ...literalPaths,
                      ],
                  }
                : undefined;
        case 'styles':
            files = select((file) => file.endsWith('.css'), '**/*.css');

            return files.length
                ? {
                      command,
                      executable: 'stylelint',
                      args: [
                          '--allow-empty-input',
                          '--ignore-path',
                          '.gitignore',
                          '--ignore-path',
                          '.stylelintignore',
                          '--cache',
                          `--cache-location=${cacheFolder}/stylelint/.stylelintcache`,
                          ...flags,
                          '--',
                          ...files,
                          ...literalPaths,
                      ],
                  }
                : undefined;
        case 'format':
        case 'format:check':
            files = select((file) => formatExtensions.test(file), prettierPattern);

            return files.length
                ? {
                      command,
                      executable: 'prettier',
                      args: [
                          '--experimental-cli',
                          command === 'format' ? '--write' : '--check',
                          '--no-error-on-unmatched-pattern',
                          '--cache',
                          ...flags,
                          // Experimental CLI считает glob после -- буквальным путём.
                          // Префикс ./ защищает имена с дефисом без отключения glob.
                          ...[...files, ...literalPaths].map((file) =>
                              file.startsWith('-') ? `./${file}` : file,
                          ),
                      ],
                  }
                : undefined;
        case 'knip':
            return {
                command,
                executable: 'knip',
                args: [
                    '--no-config-hints',
                    '--cache',
                    `--cache-location=${cacheFolder}/knip`,
                    ...extraArgs,
                ],
            };
        case 'secretlint':
            files = changedFiles ?? ['**/*'];

            return files.length
                ? {
                      command,
                      executable: 'secretlint',
                      args: [...flags, '--', ...files, ...literalPaths],
                  }
                : undefined;
    }
}

export function parseOptions(args: string[], aggregate: boolean) {
    let changed = false;
    let json = false;
    // все, что не распознано, уходит линтеру как есть.
    const forwarded: string[] = [];

    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        // после -- ничего не разбираем: это пути для линтера.
        if (arg === '--') {
            forwarded.push(...args.slice(index));
            break;
        }

        if (arg === '--changed') {
            changed = true;
        } else if (aggregate && arg === '--json') {
            json = true;
        } else {
            forwarded.push(arg);
        }
    }

    if (aggregate && forwarded.length) {
        throw new Error(`Неизвестные параметры check: ${forwarded.join(' ')}`);
    }
    // явные пути и --changed задают две разные области проверки.
    if (changed && forwarded.some((arg) => !arg.startsWith('-'))) {
        throw new Error(
            'В режиме --changed не передавайте пути. Значение флага пишите через =, например --max-warnings=0.',
        );
    }

    return {
        changed,
        json,
        forwarded,
    };
}
