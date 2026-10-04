import { randomUUID } from 'node:crypto';
import { lstat, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type Edit, type SetupPlan } from './types.js';

export function previewSetup(plan: SetupPlan): string {
    return plan.edits
        .map((edit) =>
            [
                `--- ${edit.before === null ? '/dev/null' : edit.file}`,
                `+++ ${edit.file}`,
                ...(edit.before
                    ?.trimEnd()
                    .split('\n')
                    .map((line) => `-${line}`) ?? []),
                ...edit.after
                    .trimEnd()
                    .split('\n')
                    .map((line) => `+${line}`),
            ].join('\n'),
        )
        .join('\n\n');
}

async function assertUnchanged(file: string, before: Edit['before'], message: string) {
    const stat = await lstat(file);

    if (before === null || !stat.isFile() || (await readFile(file, 'utf8')) !== before) {
        throw new Error(message);
    }

    return stat;
}

async function writeNewFile(file: string, content: string, created: string[]): Promise<void> {
    // wx не даст перезаписать файл, который уже создал другой процесс.
    const handle = await open(file, 'wx');
    // После открытия файл принадлежит нам: при сбое откат удалит и частичное содержимое.
    created.push(file);

    try {
        await handle.writeFile(content);
    } finally {
        await handle.close();
    }
}

export async function applySetup(cwd: string, plan: SetupPlan): Promise<void> {
    // Проверяем весь план до записи: содержимое могло измениться после preview.
    for (const edit of plan.edits) {
        const target = path.join(cwd, edit.file);

        if (edit.file.includes('/') || edit.file.includes('\\') || edit.file === '..') {
            throw new Error('План содержит недопустимый путь.');
        }

        try {
            // eslint-disable-next-line no-await-in-loop -- Проверяем весь план перед записью, сохраняя порядок диагностики конфликтов.
            await assertUnchanged(
                target,
                edit.before,
                `Файл ${edit.file} изменился; повторите построение плана.`,
            );
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'ENOENT' || edit.before !== null) {
                throw error;
            }
        }
    }

    const created: string[] = [];
    const temp = path.join(cwd, `.arui-lint-${randomUUID()}.tmp`);

    try {
        // package.json заменяем последним, чтобы откатить новые файлы при ошибке записи.
        for (const edit of plan.edits.filter((item) => item.before === null)) {
            const target = path.join(cwd, edit.file);

            // eslint-disable-next-line no-await-in-loop -- Последовательная запись позволяет откатить только файлы, созданные этим запуском.
            await writeNewFile(target, edit.after, created);
        }

        const manifest = plan.edits.find((edit) => edit.file === 'package.json');

        if (manifest) {
            const target = path.join(cwd, 'package.json');
            // Пока создавались конфиги, package.json мог измениться — проверяем ещё раз.
            const stat = await assertUnchanged(
                target,
                manifest.before,
                'package.json изменился во время записи.',
            );

            // Пишем рядом во временный файл, затем целиком заменяем package.json.
            await writeFile(temp, manifest.after, { flag: 'wx', mode: stat.mode });
            await rename(temp, target);
        }
    } catch (error) {
        await Promise.all(created.map((file) => unlink(file)));
        throw error;
    } finally {
        // После успешного rename временного файла уже нет.
        await unlink(temp).catch((error: NodeJS.ErrnoException) => {
            if (error.code !== 'ENOENT') throw error;
        });
    }
}
