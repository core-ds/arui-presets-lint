import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'vitest';

import { applySetup, planSetup, previewSetup, setupProject } from '../cli/setup.js';

async function readManifest(cwd: string) {
    return JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8')) as {
        scripts: Record<string, string>;
        prettier?: string | { tabWidth: number };
        eslintConfig?: unknown;
        commitlint?: unknown;
        devDependencies: Record<string, string>;
    };
}

async function withProject(pkg: unknown, run: (cwd: string) => Promise<void>) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-setup-test-'));
    try {
        await writeFile(path.join(cwd, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
        await run(cwd);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

describe('init', () => {
    it('создает план без записи и повторный запуск не меняет проект', async () => {
        await withProject(
            { name: 'app', devDependencies: { 'arui-presets-lint': '11.2.0' } },
            async (cwd) => {
                const plan = await planSetup(cwd);
                assert.deepEqual(await readdir(cwd), ['package.json']);
                assert.equal(plan.edits.length, 4);
                assert.match(previewSetup(plan), /\+\+\+ eslint.config.mts/);
                await applySetup(cwd, plan);
                const pkg = await readManifest(cwd);
                assert.equal(
                    pkg.scripts['lint:check'],
                    'arui-presets-lint scripts && arui-presets-lint styles && arui-presets-lint format:check && arui-presets-lint knip && arui-presets-lint secretlint',
                );
                assert.equal(pkg.prettier, 'arui-presets-lint/prettier');
                assert.equal((await planSetup(cwd)).edits.length, 0);
                assert.match(
                    await readFile(path.join(cwd, 'package.json'), 'utf8'),
                    /\n {2}"name"/,
                );
            },
        );
    });

    it('сохраняет пользовательские конфиги и scripts', async () => {
        await withProject(
            { scripts: { 'lint:check': 'custom-check' }, prettier: { tabWidth: 2 } },
            async (cwd) => {
                await writeFile(path.join(cwd, 'eslint.config.js'), 'custom');
                await writeFile(path.join(cwd, 'knip.json'), '{}');
                await writeFile(path.join(cwd, '.secretlintrc.json'), '{}');
                const plan = await planSetup(cwd);
                assert.equal(
                    plan.edits.some((edit) => edit.file !== 'package.json'),
                    false,
                );
                await applySetup(cwd, plan);
                assert.equal(await readFile(path.join(cwd, 'eslint.config.js'), 'utf8'), 'custom');
                const pkg = await readManifest(cwd);
                assert.equal(pkg.scripts['lint:check'], 'custom-check');
                assert.deepEqual(pkg.prettier, { tabWidth: 2 });
                assert.match(plan.warnings.join('\n'), /Скрипт lint:check сохранен/);
            },
        );
    });

    it('не удаляет legacy-конфиг с пользовательскими правилами', async () => {
        const eslintConfig = {
            extends: 'arui-presets-lint/eslint',
            rules: { 'no-console': 'off' },
        };
        await withProject({ eslintConfig }, async (cwd) => {
            const plan = await planSetup(cwd);
            assert.equal(
                plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                false,
            );
            await applySetup(cwd, plan);
            const pkg = await readManifest(cwd);
            assert.deepEqual(pkg.eslintConfig, eslintConfig);
            assert.match(plan.warnings.join('\n'), /вручную/);
        });
    });

    it('dry-run возвращает JSON-план и не пишет файлы', async () => {
        await withProject({}, async (cwd) => {
            const originalLog = console.log;
            const output: string[] = [];
            console.log = (value: string) => {
                output.push(value);
            };
            try {
                await setupProject(cwd, ['--dry-run', '--json']);
            } finally {
                console.log = originalLog;
            }
            const report = JSON.parse(output[0]) as { dryRun: boolean; edits: unknown[] };
            assert.equal(report.dryRun, true);
            assert.equal(report.edits.length, 4);
            assert.deepEqual(await readdir(cwd), ['package.json']);
        });
    });

    it('сохраняет внешний конфиг и не создает конкурирующий', async () => {
        await withProject({}, async (cwd) => {
            await writeFile(path.join(cwd, '.eslintrc.json'), '{}');
            await writeFile(path.join(cwd, 'prettier.config.mjs'), 'export default {};');
            const plan = await planSetup(cwd);
            assert.equal(
                plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                false,
            );
            await applySetup(cwd, plan);
            const pkg = await readManifest(cwd);
            assert.equal(pkg.prettier, undefined);
        });
    });

    it('отклоняет устаревший план до любых изменений', async () => {
        await withProject({}, async (cwd) => {
            const plan = await planSetup(cwd);
            await writeFile(path.join(cwd, 'package.json'), '{"name":"changed"}');
            await assert.rejects(applySetup(cwd, plan), /изменился/);
            assert.deepEqual(await readdir(cwd), ['package.json']);
        });
    });

    it('не перезаписывает файл, созданный после планирования', async () => {
        await withProject({}, async (cwd) => {
            const plan = await planSetup(cwd);
            await writeFile(path.join(cwd, 'knip.ts'), 'custom');
            await assert.rejects(applySetup(cwd, plan), /изменился/);
            assert.equal(await readFile(path.join(cwd, 'knip.ts'), 'utf8'), 'custom');
            assert.deepEqual((await readdir(cwd)).toSorted(), ['knip.ts', 'package.json']);
        });
    });

    it('не следует симлинку package.json', async () => {
        await withProject({}, async (cwd) => {
            await writeFile(path.join(cwd, 'actual.json'), '{}');
            await rm(path.join(cwd, 'package.json'));
            await symlink('actual.json', path.join(cwd, 'package.json'));
            await assert.rejects(planSetup(cwd), /обычным файлом/);
        });
    });

    it('не считает обычный файл .config каталогом настроек', async () => {
        await withProject({}, async (cwd) => {
            await writeFile(path.join(cwd, '.config'), 'настройки другого инструмента');
            await applySetup(cwd, await planSetup(cwd));
            assert.equal(
                await readFile(path.join(cwd, '.config'), 'utf8'),
                'настройки другого инструмента',
            );
            assert.equal((await planSetup(cwd)).edits.length, 0);
        });
    });

    it('отклоняет неверный package.json и неизвестные опции', async () => {
        await withProject({ scripts: [] }, async (cwd) => {
            await assert.rejects(planSetup(cwd), /scripts/);
            await assert.rejects(setupProject(cwd, ['--force']), /только/);
            await writeFile(path.join(cwd, 'package.json'), '[]');
            await assert.rejects(planSetup(cwd), /объект/);
        });
    });
});
