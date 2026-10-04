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

describe('вывод команды init', () => {
    it('показывает текстовый dry-run и ручные шаги без изменения файлов', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, ['--dry-run']);
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

    it('применяет настройки с --json и выводит только JSON-отчет', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, ['--json']);
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

    it('кратко сообщает о добавленных командах в существующем проекте', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, ['--json']);
            const manifest = path.join(cwd, 'package.json');
            const pkg = JSON.parse(await readFile(manifest, 'utf8')) as {
                scripts: Record<string, string>;
                [key: string]: unknown;
            };
            pkg.description = 'Содержимое manifest не должно попадать в сводку.'.repeat(100);
            pkg.devDependencies = { 'arui-presets-lint': '11.2.0' };
            pkg.scripts['lint:scripts'] += ' --max-warnings 0 --cache';
            pkg.scripts['lint:styles'] += ' --max-warnings 0';
            delete pkg.scripts['lint:check'];
            delete pkg.scripts['lint:unused'];
            delete pkg.scripts['lint:secrets'];
            await writeFile(manifest, JSON.stringify(pkg));
            const count = output().length;

            await setupProject(cwd, []);
            const messages = output().slice(count);
            assert.equal(
                messages[0],
                'Настройка линтеров завершена.\nОбновлен package.json.\nДобавлены команды: lint:check, lint:unused, lint:secrets.',
            );
            assert.ok(messages.includes('\nОбратите внимание:'));
            assert.ok(
                messages.includes(
                    '- Скрипт lint:scripts сохранен: "arui-presets-lint scripts --max-warnings 0 --cache"',
                ),
            );
            assert.doesNotMatch(messages.join('\n'), /Содержимое manifest|---|\+\+\+/);
            assert.equal(messages.at(-1)?.trim(), 'Проверить проект: yarn lint:check');
        });
    });

    it('сообщает о записи настроек и об отсутствии изменений при повторном запуске', async () => {
        await withProject(async (cwd, output) => {
            await setupProject(cwd, []);
            assert.match(output()[0], /^Настройка линтеров завершена\./);
            assert.match(output()[0], /Создан eslint\.config\.mts\./);
            assert.match(output()[0], /Создан knip\.ts\./);
            assert.match(output()[0], /Создан \.secretlintrc\.json\./);
            assert.match(output()[0], /Обновлен package\.json\./);
            assert.match(output()[0], /Добавлены настройки: prettier, stylelint, commitlint\./);
            assert.match(output()[0], /Добавлены команды: lint:check, lint:scripts/);
            assert.doesNotMatch(output()[0], /---|\+\+\+|"scripts"/);
            assert.equal(output().at(-1)?.trim(), 'Проверить проект: yarn lint:check');
            const count = output().length;
            const before = await readFile(path.join(cwd, 'package.json'), 'utf8');
            await setupProject(cwd, []);
            assert.equal(output()[count], 'Изменения не требуются.');
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
        });
    });
});
