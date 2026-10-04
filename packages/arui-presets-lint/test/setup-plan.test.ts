import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
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
            await applySetup(cwd, await planSetup(cwd));
            const after = await readFile(path.join(cwd, 'package.json'), 'utf8');
            assert.ok(after.startsWith(`{\r\n${indent}"name"`));
            assert.ok(after.endsWith('\r\n'));
            assert.doesNotMatch(after, /(?<!\r)\n/);
            assert.deepEqual((await readManifest(cwd)).custom, pkg.custom);
        });
    });

    it.each([
        'eslint.config.js.bak',
        '.eslintrc.json.bak',
        '.secretlintrc.json.bak',
        'secretlint.config.js.bak',
        '.prettierrc.json.bak',
        'prettier.config.ts.bak',
        '.stylelintrc.json.bak',
        'stylelint.config.mjs.bak',
        '.commitlintrc.bak',
        'commitlint.config.cts.bak',
        '.config/stylelintrc.json.bak',
    ])('резервный файл %s не мешает настройке линтеров', async (file) => {
        await withProject({}, async (cwd) => {
            const backup = path.join(cwd, file);
            await mkdir(path.dirname(backup), { recursive: true });
            await writeFile(backup, 'Пользовательская резервная копия');
            const plan = await planSetup(cwd);
            assert.deepEqual(plan.edits.map((edit) => edit.file).toSorted(), [
                '.secretlintrc.json',
                'eslint.config.mts',
                'knip.ts',
                'package.json',
            ]);
            await applySetup(cwd, plan);
            const pkg = await readManifest(cwd);
            assert.equal(pkg.prettier, 'arui-presets-lint/prettier');
            assert.deepEqual(pkg.stylelint, { extends: 'arui-presets-lint/stylelint' });
            assert.deepEqual(pkg.commitlint, {
                extends: './node_modules/arui-presets-lint/commitlint',
            });
            assert.equal(await readFile(backup, 'utf8'), 'Пользовательская резервная копия');
        });
    });

    it.each([
        ['eslint.config.js', 'eslint.config.mts'],
        ['eslint.config.mjs', 'eslint.config.mts'],
        ['eslint.config.cjs', 'eslint.config.mts'],
        ['eslint.config.ts', 'eslint.config.mts'],
        ['eslint.config.mts', 'eslint.config.mts'],
        ['eslint.config.cts', 'eslint.config.mts'],
        ['.eslintrc', 'eslint.config.mts'],
        ['.eslintrc.cjs', 'eslint.config.mts'],
        ['.eslintrc.yaml', 'eslint.config.mts'],
        ['.secretlintrc', '.secretlintrc.json'],
        ['.secretlintrc.json', '.secretlintrc.json'],
        ['.secretlintrc.yml', '.secretlintrc.json'],
        ['.secretlintrc.js', '.secretlintrc.json'],
        ['.secretlintrc.cjs', '.secretlintrc.json'],
    ])('сохраняет действующий конфиг %s', async (file, generated) => {
        await withProject({}, async (cwd) => {
            await writeFile(path.join(cwd, file), 'Пользовательский конфиг');
            const plan = await planSetup(cwd);
            assert.equal(
                plan.edits.some((edit) => edit.file === generated),
                false,
            );
            await applySetup(cwd, plan);
            assert.equal(await readFile(path.join(cwd, file), 'utf8'), 'Пользовательский конфиг');
        });
    });

    it.each([
        ['prettier', '.prettierrc'],
        ['prettier', '.prettierrc.json5'],
        ['prettier', '.prettierrc.toml'],
        ['prettier', '.prettierrc.mts'],
        ['prettier', 'prettier.config.cts'],
        ['stylelint', '.stylelintrc'],
        ['stylelint', '.stylelintrc.yaml'],
        ['stylelint', '.stylelintrc.ts'],
        ['stylelint', 'stylelint.config.mjs'],
        ['stylelint', '.config/stylelintrc.json'],
        ['commitlint', '.commitlintrc'],
        ['commitlint', '.commitlintrc.yml'],
        ['commitlint', '.commitlintrc.mts'],
        ['commitlint', 'commitlint.config.cts'],
    ])('сохраняет настройки %s из %s', async (key, file) => {
        await withProject({}, async (cwd) => {
            const config = path.join(cwd, file);
            await mkdir(path.dirname(config), { recursive: true });
            await writeFile(config, 'Пользовательский конфиг');
            await applySetup(cwd, await planSetup(cwd));
            assert.equal((await readManifest(cwd))[key], undefined);
            assert.equal(await readFile(config, 'utf8'), 'Пользовательский конфиг');
        });
    });

    it.each([
        { extendsValue: 'team-eslint' },
        { extendsValue: ['arui-presets-lint/eslint', 'team-eslint'] },
    ])('оставляет ESLint extends=$extendsValue для ручной миграции', async ({ extendsValue }) => {
        const eslintConfig = { extends: extendsValue };
        await withProject({ eslintConfig }, async (cwd) => {
            const plan = await planSetup(cwd);
            assert.equal(
                plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                false,
            );
            assert.match(plan.warnings.join('\n'), /перенесите пользовательские правила/);
            await applySetup(cwd, plan);
            assert.deepEqual((await readManifest(cwd)).eslintConfig, eslintConfig);
        });
    });

    it('init сохраняет старые настройки', async () => {
        const pkg = {
            eslintConfig: { extends: 'arui-presets-lint/eslint' },
            prettier: './node_modules/arui-presets-lint/prettier/index.js',
            scripts: { 'lint:unused': 'knip' },
        };
        await withProject(pkg, async (cwd) => {
            const plan = await planSetup(cwd);
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

    it('сообщает о подключении созданных TS-конфигов', async () => {
        await withProject({}, async (cwd) => {
            const tsconfig = '{"include":["src/**/*.ts"]}';
            await writeFile(path.join(cwd, 'tsconfig.json'), tsconfig);
            const plan = await planSetup(cwd);
            const warning = plan.warnings.find((line) => line.includes('tsconfig.json'));
            assert.ok(warning);
            assert.match(warning, /eslint\.config\.mts/);
            assert.match(warning, /knip\.ts/);
            await applySetup(cwd, plan);
            assert.equal(await readFile(path.join(cwd, 'tsconfig.json'), 'utf8'), tsconfig);
            const repeat = await planSetup(cwd);
            assert.equal(
                repeat.warnings.some((line) => line.includes('tsconfig.json')),
                false,
            );
        });
    });

    it('сохраняет пользовательские конфиги без ссылки на пресет', async () => {
        const settings = {
            prettier: { printWidth: 120 },
            stylelint: { rules: { 'color-hex-length': 'long' } },
            commitlint: { extends: ['team-commitlint'] },
        };
        await withProject(settings, async (cwd) => {
            await applySetup(cwd, await planSetup(cwd));
            const after = await readManifest(cwd);
            assert.deepEqual(after.prettier, settings.prettier);
            assert.deepEqual(after.stylelint, settings.stylelint);
            assert.deepEqual(after.commitlint, settings.commitlint);
        });
    });
});
