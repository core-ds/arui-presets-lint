import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'vitest';

import { getChangedSelection } from '../cli/changed.js';
import { runChecks } from '../cli/check.js';
import { buildInvocation, parseOptions } from '../cli/commands.js';

describe('CLI', () => {
    it('сохраняет пробелы и shell-символы в аргументах', () => {
        const args = ['a b.ts', '--rule', '{"no-console":"off"}', '$(echo unsafe)'];
        const invocation = buildInvocation('scripts', args);

        assert.deepEqual(invocation?.args, [...args, '--', '.']);
        assert.deepEqual(buildInvocation('scripts', ['--', '-name.ts'])?.args, [
            '--',
            '.',
            '-name.ts',
        ]);
    });

    it('разбирает параметры check и отклоняет неоднозначные вызовы', () => {
        assert.deepEqual(parseOptions(['--changed', '--json'], true), {
            changed: true,
            json: true,
            forwarded: [],
        });
        assert.throws(() => parseOptions(['--fix'], true));
        assert.throws(() => parseOptions(['--changed', 'src'], false));
        assert.throws(() => parseOptions(['--changed', '--max-warnings', '0'], false));
        assert.deepEqual(parseOptions(['--changed', '--max-warnings=0'], false).forwarded, [
            '--max-warnings=0',
        ]);
        assert.deepEqual(parseOptions(['--fix'], false).forwarded, ['--fix']);
    });

    it('выбирает файлы для каждой проверки и сохраняет полный Knip', () => {
        const selection = { files: ['a b.ts', 'styles.css', 'guide.md', 'logo.svg'], full: false };

        assert.deepEqual(buildInvocation('scripts', [], selection)?.args, [
            '--no-warn-ignored',
            '--',
            'a b.ts',
            'styles.css',
            'guide.md',
            'logo.svg',
        ]);
        assert.equal(buildInvocation('styles', [], selection)?.args.at(-1), 'styles.css');
        assert.deepEqual(buildInvocation('format:check', [], selection)?.args.slice(-2), [
            'a b.ts',
            'styles.css',
        ]);
        assert.equal(buildInvocation('secretlint', [], selection)?.args.at(-1), 'logo.svg');
        assert.equal(buildInvocation('format', [], selection)?.args.includes('--write'), true);
        assert.equal(buildInvocation('knip', [], selection)?.executable, 'knip');
        assert.equal(buildInvocation('scripts', [], { files: [], full: false }), undefined);
        assert.equal(buildInvocation('styles', [], { files: [], full: false }), undefined);
        assert.equal(buildInvocation('format:check', [], { files: [], full: false }), undefined);
        assert.equal(buildInvocation('secretlint', [], { files: [], full: false }), undefined);
        assert.deepEqual(buildInvocation('scripts', [], { ...selection, full: true })?.args, [
            '--',
            '.',
        ]);
    });

    it('передаёт ESLint остальные типы файлов из его конфигурации', () => {
        assert.deepEqual(
            buildInvocation(
                'scripts',
                [],
                {
                    files: ['config.yaml', 'page.html', 'logo.svg'],
                    full: false,
                },
            )?.args,
            ['--no-warn-ignored', '--', 'config.yaml', 'page.html', 'logo.svg'],
        );
    });

    it('продолжает проверки после ошибки и возвращает ненулевой код', async () => {
        const called: string[] = [];
        const report = await runChecks(async (invocation) => {
            called.push(invocation.command);
            return { exitCode: invocation.command === 'scripts' ? 2 : 0, stdout: 'result' };
        });

        assert.deepEqual(called, ['scripts', 'styles', 'format:check', 'knip', 'secretlint']);
        assert.equal(report.exitCode, 1);
        assert.equal(report.results[0].status, 'failed');
        assert.equal(report.results.at(-1)?.status, 'passed');
    });

    it('сообщает о запуске каждой проверки', async () => {
        const progress: string[] = [];

        await runChecks(
            async () => ({ exitCode: 0 }),
            undefined,
            (command, index, total) => progress.push(`${index + 1}/${total}:${command}`),
        );

        assert.deepEqual(progress, [
            '1/5:scripts',
            '2/5:styles',
            '3/5:format:check',
            '4/5:knip',
            '5/5:secretlint',
        ]);
    });

    it('пропускает пустые проверки, но запускает Knip', async () => {
        const called: string[] = [];
        const report = await runChecks(
            async (invocation) => {
                called.push(invocation.command);
                return { exitCode: 0 };
            },
            { files: [], full: false },
        );

        assert.deepEqual(called, ['knip']);
        assert.equal(report.exitCode, 0);
        assert.equal(report.results.filter((result) => result.status === 'skipped').length, 4);
        assert.deepEqual(report.results[0], {
            command: 'scripts',
            status: 'skipped',
            exitCode: 0,
            stdout: '',
            stderr: '',
        });
    });
});

async function withRepo(
    run: (dir: string, git: (...args: string[]) => string) => Promise<void>,
    { initialCommit = true } = {},
) {
    const dir = await mkdtemp(path.join(os.tmpdir(), 'arui-lint-test-'));
    const git = (...args: string[]) =>
        execFileSync('git', args, {
            cwd: dir,
            encoding: 'utf8',
            env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' },
        }).trim();

    try {
        git('init', '--quiet');
        git('config', 'user.name', 'Test');
        git('config', 'user.email', 'test@example.com');
        git('config', 'core.hooksPath', path.join(dir, 'no-hooks'));

        await writeFile(path.join(dir, 'initial.ts'), 'export const initial = 1;');

        if (initialCommit) {
            git('add', '.');
            git('commit', '--quiet', '-m', 'initial');
        }

        await run(dir, git);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

describe('выбор изменённых файлов Git', () => {
    it('учитывает staged, unstaged, untracked и необычные имена', async () => {
        await withRepo(async (dir, git) => {
            await writeFile(path.join(dir, 'initial.ts'), 'export const initial = 2;');
            await writeFile(path.join(dir, 'a b.ts'), 'export {};');

            git('add', 'a b.ts');

            await writeFile(path.join(dir, 'line\nbreak.ts'), 'export {};');

            assert.deepEqual(await getChangedSelection(dir), {
                files: ['a b.ts', 'initial.ts', 'line\nbreak.ts'],
                full: false,
            });
        });
    });

    it('учитывает staged-файл, если рабочая копия совпадает с HEAD', async () => {
        await withRepo(async (dir, git) => {
            const file = path.join(dir, 'initial.ts');

            await writeFile(file, 'export const initial = 2;');

            git('add', 'initial.ts');

            await writeFile(file, 'export const initial = 1;');

            assert.deepEqual(await getChangedSelection(dir), {
                files: ['initial.ts'],
                full: false,
            });
        });
    });

    it('работает в репозитории без коммитов', async () => {
        await withRepo(
            async (dir, git) => {
                await writeFile(path.join(dir, 'staged.ts'), 'export {};');

                git('add', 'staged.ts');

                assert.deepEqual(await getChangedSelection(dir), {
                    files: ['initial.ts', 'staged.ts'],
                    full: false,
                });
            },
            { initialCommit: false },
        );
    });

    it('не передаёт удалённые файлы и выбирает полный прогон', async () => {
        await withRepo(async (dir) => {
            await rm(path.join(dir, 'initial.ts'));

            assert.deepEqual(await getChangedSelection(dir), { files: [], full: true });
        });
    });

    it('удаление файла вне подпапки требует полного прогона', async () => {
        await withRepo(async (dir) => {
            const sub = path.join(dir, 'sub');

            await mkdir(sub);
            await writeFile(path.join(sub, 'a.ts'), 'export {};');
            await rm(path.join(dir, 'initial.ts'));

            assert.deepEqual(await getChangedSelection(sub), { files: ['a.ts'], full: true });
        });
    });

    it('изменение конфигурации требует полного прогона', async () => {
        await withRepo(async (dir) => {
            await writeFile(path.join(dir, 'tsconfig.json'), '{}');

            assert.equal((await getChangedSelection(dir)).full, true);

            await rm(path.join(dir, 'tsconfig.json'));
            await writeFile(path.join(dir, '.editorconfig'), 'root = true');

            assert.equal((await getChangedSelection(dir)).full, true);
        });
    });

    it('распознаёт конфиги линтеров, манифесты и lock-файлы по имени', async () => {
        const configs = [
            'eslint.config.mts',
            '.eslintrc.cjs',
            '.prettierrc',
            '.prettierrc.json',
            'prettier.config.mjs',
            'stylelint.config.js',
            '.stylelintrc.yaml',
            '.secretlintrc.json',
            'secretlint.config.js',
            'secretlint.config.ts',
            'knip.json',
            'knip.jsonc',
            '.knip.json',
            '.knip.jsonc',
            'knip.ts',
            'knip.js',
            'knip.config.ts',
            'knip.config.js',
            'tsconfig.build.json',
            'yarn.lock',
            'package-lock.json',
            'pnpm-lock.yaml',
            '.yarnrc.yml',
            '.gitignore',
            '.prettierignore',
            'sub/package.json',
        ];
        const regular = [
            'my-tsconfig.json',
            'knipper.ts',
            'knip.md',
            'knip.config.json',
            'package.json.ts',
            'prettier-utils.ts',
        ];
        await withRepo(async (dir) => {
            await mkdir(path.join(dir, 'sub'));

            // Любой конфиг включает полный прогон, поэтому каждый проверяется отдельно и удаляется.
            const assertFull = async (name: string) => {
                await writeFile(path.join(dir, name), '');
                assert.equal((await getChangedSelection(dir)).full, true, name);
                await rm(path.join(dir, name));
            };

            for (const name of configs) {
                // eslint-disable-next-line no-await-in-loop -- Проверки меняют один и тот же репозиторий и должны идти последовательно.
                await assertFull(name);
            }
            await Promise.all(regular.map((name) => writeFile(path.join(dir, name), '')));

            assert.deepEqual(await getChangedSelection(dir), { files: regular.toSorted(), full: false });
        });
    });

    it('переименование передаёт новый путь и требует полного прогона', async () => {
        await withRepo(async (dir, git) => {
            git('mv', 'initial.ts', 'renamed.ts');
            assert.deepEqual(await getChangedSelection(dir), {
                files: ['renamed.ts'],
                full: true,
            });
        });
    });

    it('переименование с изменением регистра требует полного прогона', async () => {
        await withRepo(async (dir, git) => {
            git('mv', 'initial.ts', 'INITIAL.ts');

            assert.deepEqual(await getChangedSelection(dir), {
                files: ['INITIAL.ts'],
                full: true,
            });
        });
    });

    it('не передаёт симлинки линтерам', async () => {
        await withRepo(async (dir) => {
            await writeFile(path.join(dir, 'initial.ts'), 'export const initial = 2;');
            await symlink('initial.ts', path.join(dir, 'link.ts'));

            assert.deepEqual(await getChangedSelection(dir), {
                files: ['initial.ts'],
                full: false,
            });
        });
    });

    it('пути от корня репозитория при diff.relative', async () => {
        await withRepo(async (dir, git) => {
            git('config', 'diff.relative', 'true');

            const sub = path.join(dir, 'sub');

            await mkdir(sub);
            await writeFile(path.join(sub, 'a.ts'), 'export {};');

            git('add', '.');
            git('commit', '--quiet', '-m', 'sub');

            await writeFile(path.join(sub, 'a.ts'), 'export const a = 1;');

            assert.deepEqual(await getChangedSelection(sub), {
                files: ['a.ts'],
                full: false,
            });
        });
    });

    it('работает из подпапки и исключает соседние файлы', async () => {
        await withRepo(async (dir, git) => {
            const sub = path.join(dir, 'sub');

            await mkdir(sub);
            await writeFile(path.join(sub, 'a.ts'), 'export {};');

            git('add', '.');
            git('commit', '--quiet', '-m', 'sub');

            await writeFile(path.join(sub, 'a.ts'), 'export const a = 1;');
            await writeFile(path.join(sub, 'new.ts'), 'export {};');
            await writeFile(path.join(dir, 'outside.ts'), 'export {};');

            assert.deepEqual(await getChangedSelection(sub), {
                files: ['a.ts', 'new.ts'],
                full: false,
            });
        });
    });

    it('учитывает конфигурацию родителя при запуске из подпапки', async () => {
        await withRepo(async (dir) => {
            const sub = path.join(dir, 'sub');

            await mkdir(sub);
            await writeFile(path.join(dir, 'package.json'), '{}');

            assert.deepEqual(await getChangedSelection(sub), { files: [], full: true });
        });
    });
});
