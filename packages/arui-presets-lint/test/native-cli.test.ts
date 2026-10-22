import { execa } from 'execa';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'vitest';

import { buildInvocation } from '../cli/commands.js';

describe('CLI с настоящим Prettier', () => {
    it('проверяет и форматирует файлы, выбранные общим glob', async () => {
        const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-format-test-'));

        try {
            await mkdir(path.join(cwd, 'src'));

            const file = path.join(cwd, 'src', 'example.js');

            await writeFile(file, 'const value=1');

            const check = buildInvocation('format:check')!;
            const result = await execa(check.executable, check.args, {
                cwd,
                preferLocal: true,
                localDir: import.meta.dirname,
                reject: false,
            });

            assert.equal(result.exitCode, 1);
            assert.match(`${result.stdout}\n${result.stderr}`, /src\/example\.js/);

            const format = buildInvocation('format')!;

            await execa(format.executable, format.args, {
                cwd,
                preferLocal: true,
                localDir: import.meta.dirname,
            });

            assert.equal(await readFile(file, 'utf8'), 'const value = 1;\n');
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });

    it('сохраняет имя файла, начинающееся с дефиса', async () => {
        const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-format-path-test-'));

        try {
            await writeFile(path.join(cwd, '-example.js'), 'const value=1');

            const invocation = buildInvocation('format:check', [], {
                files: ['-example.js'],
                full: false,
            })!;

            const result = await execa(invocation.executable, invocation.args, {
                cwd,
                preferLocal: true,
                localDir: import.meta.dirname,
                reject: false,
            });

            assert.equal(result.exitCode, 1);
            assert.match(`${result.stdout}\n${result.stderr}`, /-example\.js/);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});

describe('CLI с JSON-отчётом', () => {
    it('возвращает отдельный error-envelope, если проверки не начались', async () => {
        const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-json-error-test-'));

        try {
            const result = await execa(
                'tsx',
                [path.resolve(import.meta.dirname, '../cli/index.mts'), 'check', '--changed', '--json'],
                {
                    cwd,
                    preferLocal: true,
                    localDir: import.meta.dirname,
                    reject: false,
                },
            );

            const report: unknown = JSON.parse(result.stdout);

            assert.equal(result.exitCode, 1);
            assert.ok(report && typeof report === 'object');
            assert.deepEqual(Object.keys(report).toSorted(), ['error', 'exitCode', 'results']);
            assert.ok('exitCode' in report);
            assert.ok('error' in report);
            assert.ok('results' in report);
            assert.equal(report.exitCode, 1);

            if (typeof report.error !== 'string') {
                assert.fail('Поле error должно быть строкой');
            }

            assert.match(report.error, /not a git repository/);
            assert.deepEqual(report.results, []);
        } finally {
            await rm(cwd, { recursive: true, force: true });
        }
    });
});
