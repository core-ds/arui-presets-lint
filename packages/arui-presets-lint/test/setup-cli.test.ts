import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it, vi } from 'vitest';

import { type SetupPlan, setupProject } from '../cli/setup.js';

async function withProject(run: (cwd: string, output: () => string[]) => Promise<void>) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-setup-cli-'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
        await writeFile(path.join(cwd, 'package.json'), '{}\n');
        await run(cwd, () => log.mock.calls.map(([value]) => String(value)));
    } finally {
        log.mockRestore();
        await rm(cwd, { recursive: true, force: true });
    }
}

describe('вывод команды init/migrate', () => {
    it('показывает текстовый dry-run и ручные шаги без изменения файлов', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, false, ['--dry-run']);
            const messages = output();
            assert.match(messages[0], /--- \/dev\/null\n\+\+\+ eslint\.config\.mts/);
            assert.match(messages[0], /--- package\.json\n\+\+\+ package\.json\n-\{\}/);
            assert.ok(
                messages.includes(
                    'Вручную: Добавьте arui-presets-lint в devDependencies через пакетный менеджер проекта.',
                ),
            );
            assert.equal(messages.at(-1), 'Предпросмотр: файлы не изменены.');
            assert.deepEqual(await readdir(cwd), ['package.json']);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), '{}\n');
        });
    });

    it('применяет настройки с --json и выводит только JSON-отчёт', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, true, ['--json']);
            assert.equal(output().length, 1);
            const report = JSON.parse(output()[0]) as SetupPlan & { dryRun: boolean };
            assert.equal(report.dryRun, false);
            assert.equal(report.edits.length, 4);
            assert.match(report.warnings.join('\n'), /Добавьте arui-presets-lint/);
            assert.deepEqual((await readdir(cwd)).toSorted(), [
                '.secretlintrc.json',
                'eslint.config.mts',
                'knip.ts',
                'package.json',
            ]);
            assert.match(await readFile(path.join(cwd, 'package.json'), 'utf8'), /"lint:check"/);
        });
    });

    it('сообщает о записи настроек и об отсутствии изменений при повторном запуске', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, false, []);
            assert.equal(output().at(-1), 'Настройки записаны.');
            const count = output().length;
            const before = await readFile(path.join(cwd, 'package.json'), 'utf8');
            await setupProject(cwd, false, []);
            assert.equal(output()[count], 'Изменения не требуются.');
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
        });
    });
});
