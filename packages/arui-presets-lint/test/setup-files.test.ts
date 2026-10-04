import assert from 'node:assert/strict';
import type * as FsPromises from 'node:fs/promises';
import {
    chmod,
    mkdtemp,
    open,
    readdir,
    readFile,
    rename,
    rm,
    stat,
    writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, it, vi } from 'vitest';

import { applySetup, planSetup } from '../cli/setup.js';

// Подменяем только операции, в которых воспроизводим сбой; остальные работают с реальными файлами.
vi.mock('node:fs/promises', async (importOriginal) => {
    const actual = await importOriginal<typeof FsPromises>();
    return { ...actual, open: vi.fn(actual.open), rename: vi.fn(actual.rename) };
});

const actual = await vi.importActual<typeof FsPromises>('node:fs/promises');

afterEach(() => {
    vi.mocked(open).mockReset();
    vi.mocked(rename).mockReset();
});

async function withProject(run: (cwd: string, before: string) => Promise<void>) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-setup-files-'));
    const before = '{"name":"app","devDependencies":{"arui-presets-lint":"11.2.0"}}\n';
    try {
        await writeFile(path.join(cwd, 'package.json'), before);
        await run(cwd, before);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

describe('запись плана init/migrate', () => {
    it('откатывает созданные конфиги при ошибке записи следующего файла', async () => {
        await withProject(async (cwd, before) => {
            const plan = await planSetup(cwd, false);
            const error = new Error('Ошибка записи конфига');
            vi.mocked(open).mockImplementationOnce(actual.open).mockRejectedValueOnce(error);

            await assert.rejects(applySetup(cwd, plan), (caught) => caught === error);
            assert.deepEqual(await readdir(cwd), ['package.json']);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
        });
    });

    it('удаляет частично записанный конфиг при ошибке записи', async () => {
        await withProject(async (cwd, before) => {
            const plan = await planSetup(cwd, false);
            const error = Object.assign(new Error('Недостаточно места'), { code: 'ENOSPC' });
            vi.mocked(open).mockImplementationOnce(async (...args) => {
                const handle = await actual.open(...args);
                const write = handle.writeFile.bind(handle);
                vi.spyOn(handle, 'writeFile').mockImplementationOnce(async () => {
                    await write('partial');
                    throw error;
                });
                return handle;
            });

            await assert.rejects(applySetup(cwd, plan), (caught) => caught === error);
            assert.deepEqual(await readdir(cwd), ['package.json']);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
        });
    });

    it('сохраняет конфиг, созданный другим процессом между проверкой и записью', async () => {
        await withProject(async (cwd, before) => {
            const plan = await planSetup(cwd, false);
            vi.mocked(open).mockImplementationOnce(async (file, flags, mode) => {
                await actual.writeFile(file, 'Пользовательский конфиг');
                return actual.open(file, flags, mode);
            });

            await assert.rejects(applySetup(cwd, plan), { code: 'EEXIST' });
            assert.equal(
                await readFile(path.join(cwd, 'eslint.config.mts'), 'utf8'),
                'Пользовательский конфиг',
            );
            assert.deepEqual((await readdir(cwd)).toSorted(), [
                'eslint.config.mts',
                'package.json',
            ]);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
        });
    });

    it('откатывает конфиги и удаляет временный файл при ошибке замены package.json', async () => {
        await withProject(async (cwd, before) => {
            await writeFile(path.join(cwd, 'notes.md'), 'Пользовательский файл');
            const plan = await planSetup(cwd, true);
            const error = new Error('Ошибка замены package.json');
            vi.mocked(rename).mockRejectedValueOnce(error);

            await assert.rejects(applySetup(cwd, plan), (caught) => caught === error);
            assert.deepEqual((await readdir(cwd)).toSorted(), ['notes.md', 'package.json']);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
            assert.equal(
                await readFile(path.join(cwd, 'notes.md'), 'utf8'),
                'Пользовательский файл',
            );
        });
    });

    it('сохраняет параллельное изменение package.json и откатывает свои конфиги', async () => {
        await withProject(async (cwd) => {
            const plan = await planSetup(cwd, false);
            const changed = '{"name":"changed-by-another-process"}\n';
            // Меняем manifest после первой записи: предварительная проверка уже завершилась.
            vi.mocked(open).mockImplementationOnce(async (...args) => {
                const handle = await actual.open(...args);
                const write = handle.writeFile.bind(handle);
                vi.spyOn(handle, 'writeFile').mockImplementationOnce(async (...writeArgs) => {
                    await write(...writeArgs);
                    await actual.writeFile(path.join(cwd, 'package.json'), changed);
                });
                return handle;
            });

            await assert.rejects(applySetup(cwd, plan), /изменился во время записи/);
            assert.deepEqual(await readdir(cwd), ['package.json']);
            assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), changed);
        });
    });

    it.each(['../outside.json', 'nested/config.json', String.raw`nested\config.json`, '..'])(
        'отклоняет недопустимый путь %s до записи файлов',
        async (file) => {
            await withProject(async (cwd, before) => {
                const plan = await planSetup(cwd, false);
                plan.edits.push({ file, before: null, after: 'unexpected' });
                await assert.rejects(applySetup(cwd, plan), /недопустимый путь/);
                assert.deepEqual(await readdir(cwd), ['package.json']);
                assert.equal(await readFile(path.join(cwd, 'package.json'), 'utf8'), before);
            });
        },
    );

    it('отклоняет план, если исходный package.json был удалён', async () => {
        await withProject(async (cwd) => {
            const plan = await planSetup(cwd, false);
            await rm(path.join(cwd, 'package.json'));
            await assert.rejects(applySetup(cwd, plan), { code: 'ENOENT' });
            assert.deepEqual(await readdir(cwd), []);
        });
    });

    it('сохраняет права доступа при замене package.json', async () => {
        await withProject(async (cwd) => {
            const manifest = path.join(cwd, 'package.json');
            await chmod(manifest, 0o600);
            await applySetup(cwd, await planSetup(cwd, false));
            assert.equal((await stat(manifest)).mode % 0o1000, 0o600);
            assert.match(await readFile(manifest, 'utf8'), /"lint:check"/);
        });
    });
});
