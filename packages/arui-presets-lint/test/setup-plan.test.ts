import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, it } from 'vitest';

import { applySetup, planSetup } from '../cli/setup.js';

async function withProject(pkg: unknown, run: (cwd: string) => Promise<void>) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-setup-plan-'));
    try {
        await writeFile(path.join(cwd, 'package.json'), JSON.stringify(pkg));
        await run(cwd);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

async function readManifest(cwd: string) {
    return JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8')) as Record<
        string,
        unknown
    >;
}

describe('план настройки проекта', () => {
    it.each(['  ', '\t'])('сохраняет CRLF и отступ %j в package.json', async (indent) => {
        const pkg = { name: 'app', custom: { enabled: true } };
        await withProject(pkg, async (cwd) => {
            const before = `${JSON.stringify(pkg, null, indent)}\n`.replaceAll('\n', '\r\n');
            await writeFile(path.join(cwd, 'package.json'), before);
            await applySetup(cwd, await planSetup(cwd, false));
            const after = await readFile(path.join(cwd, 'package.json'), 'utf8');
            assert.ok(after.startsWith(`{\r\n${indent}"name"`));
            assert.ok(after.endsWith('\r\n'));
            assert.doesNotMatch(after, /(?<!\r)\n/);
            assert.deepEqual((await readManifest(cwd)).custom, pkg.custom);
        });
    });

    it.each([
        {
            extends: './node_modules/arui-presets-lint/stylelint/index.js',
            expected: 'arui-presets-lint/stylelint',
        },
        {
            extends: ['./node_modules/arui-presets-lint/stylelint', 'team-stylelint'],
            expected: ['arui-presets-lint/stylelint', 'team-stylelint'],
        },
    ])('обновляет Stylelint extends=$extends, сохраняя пользовательские правила', async (entry) => {
        const rules = { 'color-hex-length': 'long' };
        await withProject({ stylelint: { extends: entry.extends, rules } }, async (cwd) => {
            await applySetup(cwd, await planSetup(cwd, true));
            assert.deepEqual((await readManifest(cwd)).stylelint, {
                extends: entry.expected,
                rules,
            });
        });
    });

    it.each([
        { extendsValue: 'team-eslint' },
        { extendsValue: ['arui-presets-lint/eslint', 'team-eslint'] },
    ])('оставляет ESLint extends=$extendsValue для ручной миграции', async ({ extendsValue }) => {
        const eslintConfig = { extends: extendsValue };
        await withProject({ eslintConfig }, async (cwd) => {
            const plan = await planSetup(cwd, true);
            assert.equal(
                plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                false,
            );
            assert.match(plan.warnings.join('\n'), /перенесите пользовательские правила/);
            await applySetup(cwd, plan);
            assert.deepEqual((await readManifest(cwd)).eslintConfig, eslintConfig);
        });
    });

    it('init сохраняет старые настройки, которые migrate умеет переносить', async () => {
        const pkg = {
            eslintConfig: { extends: 'arui-presets-lint/eslint' },
            prettier: './node_modules/arui-presets-lint/prettier/index.js',
            scripts: { 'lint:unused': 'knip' },
        };
        await withProject(pkg, async (cwd) => {
            const plan = await planSetup(cwd, false);
            assert.equal(
                plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                false,
            );
            await applySetup(cwd, plan);
            const after = await readManifest(cwd);
            assert.deepEqual(after.eslintConfig, pkg.eslintConfig);
            assert.equal(after.prettier, pkg.prettier);
            assert.equal((after.scripts as Record<string, string>)['lint:unused'], 'knip');
        });
    });

    it.each([false, true])(
        'сообщает о подключении созданных TS-конфигов, migrate=%s',
        async (migrate) => {
            await withProject({}, async (cwd) => {
                const tsconfig = '{"include":["src/**/*.ts"]}';
                await writeFile(path.join(cwd, 'tsconfig.json'), tsconfig);
                const plan = await planSetup(cwd, migrate);
                const warning = plan.warnings.find((line) => line.includes('tsconfig.json'));
                assert.ok(warning);
                assert.match(warning, /eslint\.config\.mts/);
                assert.match(warning, /knip\.ts/);
                await applySetup(cwd, plan);
                assert.equal(await readFile(path.join(cwd, 'tsconfig.json'), 'utf8'), tsconfig);
                const repeat = await planSetup(cwd, migrate);
                assert.equal(
                    repeat.warnings.some((line) => line.includes('tsconfig.json')),
                    false,
                );
            });
        },
    );

    it('migrate сохраняет пользовательские конфиги без ссылки на пресет', async () => {
        const settings = {
            prettier: { printWidth: 120 },
            stylelint: { rules: { 'color-hex-length': 'long' } },
            commitlint: { extends: ['team-commitlint'] },
        };
        await withProject(settings, async (cwd) => {
            await applySetup(cwd, await planSetup(cwd, true));
            const after = await readManifest(cwd);
            assert.deepEqual(after.prettier, settings.prettier);
            assert.deepEqual(after.stylelint, settings.stylelint);
            assert.deepEqual(after.commitlint, settings.commitlint);
        });
    });
});
