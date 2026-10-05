import { execFile } from 'node:child_process';
import { lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import { type Selection } from './commands.js';

const execFileAsync = promisify(execFile);

// Файлы, правка которых влияет на весь проект: конфиги линтеров, манифесты и lock-файлы.
// Любое их изменение переключает --changed на полный прогон.
// Имена конфигов Knip совпадают с KNIP_CONFIG_LOCATIONS этой версии пакета.
const configPattern =
    /(?:^|\/)(?:package\.json|(?:yarn|package|pnpm)-lock\.(?:json|yaml)|yarn\.lock|tsconfig[^/]*\.json|eslint\.config\.[^/]+|knip\.jsonc?|\.knip\.jsonc?|knip\.(?:ts|js)|knip\.config\.(?:ts|js)|\.?(?:eslint|stylelint|prettier|secretlint)rc[^/]*|(?:stylelint|prettier|secretlint)\.config\.[^/]+|\.(?:gitignore|eslintignore|stylelintignore|prettierignore|secretlintignore|editorconfig)|\.yarnrc\.yml)$/;

// Хеш пустого дерева в Git: база для diff в репозитории без коммитов.
const emptyTree = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';

// Git с флагом -z разделяет пути NUL-байтом: имена с пробелами и переводами строк не ломаются.
const splitPaths = (output: string) => output.split('\0').filter(Boolean);

// преобразуем пары "git статус + путь" из --name-status в список измененных файлов
const parseDiff = (output: string) => {
    const parts = splitPaths(output);
    const entries: Array<{ path: string; deleted: boolean }> = [];

    for (let index = 0; index < parts.length; index += 2) {
        entries.push({
            path: parts[index + 1],
            deleted: parts[index] === 'D',
        });
    }

    return entries;
};

// путь относительно cwd ведёт за его пределы (в соседнюю папку или на другой диск).
const isOutside = (relative: string) =>
    relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);

export async function getChangedSelection(cwd: string): Promise<Selection> {
    const directory = await realpath(cwd);

    const git = async (args: string[]) => {
        const { stdout } = await execFileAsync('git', args, {
            cwd: directory,
            encoding: 'utf8',
            maxBuffer: 16 * 1024 * 1024,
        });
        return stdout;
    };

    const root = (await git(['rev-parse', '--show-toplevel'])).trim();

    // В свежем репозитории HEAD ещё не существует, и diff от него упадёт.
    const hasCommits = await git(['rev-parse', '--verify', '--quiet', 'HEAD']).then(
        () => true,
        () => false,
    );

    const stagedBase = hasCommits ? 'HEAD' : emptyTree;

    // Staged и unstaged получаем отдельно: их изменения могут компенсировать друг друга,
    // и тогда общий diff относительно HEAD потеряет путь.
    // --name-status позволяет отличить удаление даже на case-insensitive файловой системе.
    // Команды запускаем от корня, как и ls-files ниже: пути всегда от корня,
    // даже если в git включён diff.relative.
    const staged = parseDiff(
        await git([
            '-C',
            root,
            'diff',
            '--cached',
            '--name-status',
            '-z',
            '--no-renames',
            stagedBase,
            '--',
        ]),
    );
    const unstaged = parseDiff(
        await git(['-C', root, 'diff', '--name-status', '-z', '--no-renames', '--']),
    );

    // Новые файлы ищем от корня репозитория, чтобы пути были в том же виде, что и у diff.
    const untracked = splitPaths(
        await git(['-C', root, 'ls-files', '--others', '--exclude-standard', '-z']),
    );

    const files: string[] = [];
    let full = false;
    const changed = new Map<string, boolean>();

    for (const entry of [...staged, ...unstaged]) {
        changed.set(entry.path, entry.deleted || changed.get(entry.path) === true);
    }

    for (const gitPath of untracked) {
        if (!changed.has(gitPath)) {
            changed.set(gitPath, false);
        }
    }

    // gitPath всегда относителен корню репозитория, а не cwd.
    // Конфиги и удаления учитываем до фильтра по подпапке: они влияют на весь проект.
    for (const [gitPath, deleted] of changed) {
        const absolute = path.resolve(root, gitPath);

        if (configPattern.test(gitPath)) {
            full = true;
        }

        if (deleted) {
            // удаление может сломать импорты в неизмененных файлах, в том числе за пределами подпапки
            full = true;

            continue;
        }

        // eslint-disable-next-line no-await-in-loop -- Проверяем файлы по одному, ограничивая число открытых дескрипторов
        const stat = await lstat(absolute).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') {
                throw error;
            }

            return null;
        });

        if (!stat) {
            // Файл мог исчезнуть между вызовом Git и проверкой файловой системы.
            full = true;

            continue;
        }

        const relative = path.relative(directory, absolute);

        // Линтерам отдаем только обычные файлы внутри cwd (не папки, не симлинки, не сабмодули),
        if (stat.isFile() && !isOutside(relative)) {
            files.push(relative.split(path.sep).join('/'));
        }
    }

    return {
        files: files.toSorted(),
        full,
    };
}
