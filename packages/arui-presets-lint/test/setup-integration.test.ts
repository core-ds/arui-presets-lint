import { ESLint } from 'eslint';
import { execa } from 'execa';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import { runSecretLint } from 'secretlint';
import ts from 'typescript';
import { describe, it } from 'vitest';

import { applySetup, planSetup } from '../cli/setup.js';
import { importsConfig } from '../eslint/rules/imports.js';

const require = createRequire(import.meta.url);
const commitlintCli = path.join(
    path.dirname(require.resolve('@commitlint/cli/package.json')),
    'cli.js',
);

async function withProject(run: (cwd: string) => Promise<void>) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-setup-integration-'));
    try {
        await writeFile(
            path.join(cwd, 'package.json'),
            JSON.stringify({
                name: 'fixture',
                private: true,
                devDependencies: { 'arui-presets-lint': '11.2.0' },
            }),
        );
        await run(cwd);
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

async function installCommitlintPreset(cwd: string) {
    const installed = path.join(cwd, 'node_modules/arui-presets-lint');
    await mkdir(path.join(installed, 'commitlint'), { recursive: true });
    await writeFile(
        path.join(installed, 'package.json'),
        JSON.stringify({
            name: 'arui-presets-lint',
            type: 'module',
            exports: { './commitlint': './commitlint/index.js' },
        }),
    );
    const source = await readFile(new URL('../commitlint/index.ts', import.meta.url), 'utf8');
    await writeFile(
        path.join(installed, 'commitlint/index.js'),
        ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.ESNext },
        }).outputText,
    );
    await symlink(
        path.resolve(path.dirname(commitlintCli), '..'),
        path.join(cwd, 'node_modules/@commitlint'),
        'dir',
    );
}

async function lintCommit(cwd: string, message: string) {
    return execa(process.execPath, [commitlintCli, '--cwd', cwd], {
        cwd,
        input: message,
        reject: false,
    });
}

async function stylelintRules(cwd: string) {
    const source = `const { default: stylelint } = await import(${JSON.stringify(import.meta.resolve('stylelint'))});
        const config = await stylelint.resolveConfig('example.css');
        console.log(JSON.stringify(config.rules));`;
    const { stdout } = await execa(process.execPath, ['--input-type=module', '--eval', source], {
        cwd,
        env: { NODE_ENV: 'production' },
    });
    return JSON.parse(stdout) as Record<string, unknown>;
}

async function readManifest(cwd: string) {
    return JSON.parse(await readFile(path.join(cwd, 'package.json'), 'utf8')) as {
        prettier?: unknown;
        stylelint?: unknown;
        commitlint?: unknown;
    };
}

describe('init/migrate с настоящими инструментами', () => {
    it('созданный Knip-конфиг проходит правило пресета для default-экспорта', async () => {
        await withProject(async (cwd) => {
            const plan = await planSetup(cwd, false);
            const config = plan.edits.find((edit) => edit.file === 'knip.ts');
            assert.ok(config);
            const rule = importsConfig.rules?.['no-restricted-exports'];
            assert.ok(rule);
            const eslint = new ESLint({
                cwd,
                overrideConfigFile: true,
                overrideConfig: { rules: { 'no-restricted-exports': rule } },
            });
            const results = await eslint.lintText(config.after, { filePath: 'knip.js' });
            assert.equal(results[0].errorCount, 0, JSON.stringify(results[0].messages));
        });
    });

    it.each([false, true])(
        'загружает commitlint-пресет после настройки migrate=%s',
        async (migrate) => {
            await withProject(async (cwd) => {
                await installCommitlintPreset(cwd);
                if (migrate) {
                    await writeFile(
                        path.join(cwd, 'package.json'),
                        JSON.stringify({
                            name: 'fixture',
                            commitlint: {
                                extends: './node_modules/arui-presets-lint/commitlint/index.js',
                            },
                        }),
                    );
                    assert.equal((await lintCommit(cwd, 'feat(app): valid message')).exitCode, 0);
                }
                await applySetup(cwd, await planSetup(cwd, migrate));
                const valid = await lintCommit(cwd, 'feat(app): valid message');
                assert.equal(valid.exitCode, 0, valid.stderr);
                assert.equal((await lintCommit(cwd, 'invalid message')).exitCode, 1);
                assert.equal((await planSetup(cwd, migrate)).edits.length, 0);
            });
        },
    );

    it.each([false, true])('сохраняет Stylelint из .config, migrate=%s', async (migrate) => {
        await withProject(async (cwd) => {
            await mkdir(path.join(cwd, '.config'));
            await mkdir(path.join(cwd, 'node_modules'));
            await symlink(
                fileURLToPath(new URL('..', import.meta.url)),
                path.join(cwd, 'node_modules/arui-presets-lint'),
                'dir',
            );
            const config = JSON.stringify({ rules: { 'color-hex-length': 'long' } });
            await writeFile(path.join(cwd, '.config/stylelintrc.json'), config);
            const before = await stylelintRules(cwd);
            assert.deepEqual(before['color-hex-length'], ['long']);
            await applySetup(cwd, await planSetup(cwd, migrate));
            assert.deepEqual(await stylelintRules(cwd), before);
            assert.equal((await readManifest(cwd)).stylelint, undefined);
            assert.equal(
                await readFile(path.join(cwd, '.config/stylelintrc.json'), 'utf8'),
                config,
            );
        });
    });

    it.each([false, true])(
        'сохраняет Prettier из корня монорепозитория, migrate=%s',
        async (migrate) => {
            await withProject(async (root) => {
                const cwd = path.join(root, 'packages/app');
                await mkdir(cwd, { recursive: true });
                await writeFile(path.join(cwd, 'package.json'), '{"name":"app"}');
                await mkdir(path.join(root, 'node_modules'));
                await symlink(
                    fileURLToPath(new URL('..', import.meta.url)),
                    path.join(root, 'node_modules/arui-presets-lint'),
                    'dir',
                );
                const config = JSON.stringify({ tabWidth: 2, singleQuote: false });
                await writeFile(path.join(root, '.prettierrc.json'), config);
                const file = path.join(cwd, 'index.js');
                const before = await prettier.resolveConfig(file, { useCache: false });
                assert.deepEqual(before, { tabWidth: 2, singleQuote: false });
                await applySetup(cwd, await planSetup(cwd, migrate));
                assert.deepEqual(await prettier.resolveConfig(file, { useCache: false }), before);
                assert.equal((await readManifest(cwd)).prettier, undefined);
                assert.equal(await readFile(path.join(root, '.prettierrc.json'), 'utf8'), config);
            });
        },
    );
    it('сохраняет настройки инструментов в родительском package.json', async () => {
        await withProject(async (root) => {
            const settings = {
                name: 'monorepo',
                prettier: { tabWidth: 2, singleQuote: false },
                stylelint: { rules: { 'color-hex-length': 'long' } },
                commitlint: { rules: { 'header-max-length': [2, 'always', 45] } },
            };
            await writeFile(path.join(root, 'package.json'), JSON.stringify(settings));
            const cwd = path.join(root, 'packages/app');
            await mkdir(cwd, { recursive: true });
            await writeFile(path.join(cwd, 'package.json'), '{"name":"app"}');
            const file = path.join(cwd, 'index.js');
            const beforeStyle = await stylelintRules(cwd);
            assert.equal((await lintCommit(cwd, 'feat(app): valid message')).exitCode, 0);
            await applySetup(cwd, await planSetup(cwd, true));
            assert.deepEqual(await stylelintRules(cwd), beforeStyle);
            assert.deepEqual(
                await prettier.resolveConfig(file, { useCache: false }),
                settings.prettier,
            );
            assert.equal((await lintCommit(cwd, 'feat(app): valid message')).exitCode, 0);
            const pkg = await readManifest(cwd);
            assert.equal(pkg.prettier, undefined);
            assert.equal(pkg.stylelint, undefined);
            assert.equal(pkg.commitlint, undefined);
        });
    });

    it.each([false, true])(
        'сохраняет унаследованные ESLint и Secretlint, migrate=%s',
        async (migrate) => {
            await withProject(async (root) => {
                const cwd = path.join(root, 'packages/app');
                await mkdir(cwd, { recursive: true });
                await writeFile(path.join(cwd, 'package.json'), '{"name":"app"}');
                await writeFile(
                    path.join(root, 'eslint.config.mjs'),
                    'export default [{rules: {"no-console": "error"}}];',
                );
                await writeFile(path.join(root, '.secretlintrc.json'), '{"rules":[]}');
                const file = path.join(cwd, 'index.js');
                const before = (await new ESLint({ cwd }).calculateConfigForFile(file)) as {
                    rules: Record<string, unknown>;
                };
                assert.deepEqual(before.rules['no-console'], [2, {}]);
                const lint = () =>
                    runSecretLint({
                        cliOptions: {
                            cwd,
                            stdinContent: 'safe text',
                            stdinFileName: 'example.txt',
                        },
                        engineOptions: { cwd, formatter: 'json' },
                    });
                assert.equal((await lint()).exitStatus, 0);

                const plan = await planSetup(cwd, migrate);
                assert.equal(
                    plan.edits.some((edit) => edit.file === 'eslint.config.mts'),
                    false,
                );
                assert.equal(
                    plan.edits.some((edit) => edit.file === '.secretlintrc.json'),
                    false,
                );
                await applySetup(cwd, plan);
                const after = (await new ESLint({ cwd }).calculateConfigForFile(file)) as {
                    rules: Record<string, unknown>;
                };
                assert.deepEqual(after.rules['no-console'], before.rules['no-console']);
                assert.equal((await lint()).exitStatus, 0);
                assert.equal((await planSetup(cwd, migrate)).edits.length, 0);
            });
        },
    );

    it.each([false, true])(
        'загружает commitlint из корневой node_modules, migrate=%s',
        async (migrate) => {
            await withProject(async (root) => {
                await installCommitlintPreset(root);
                const cwd = path.join(root, 'packages/app');
                await mkdir(cwd, { recursive: true });
                await writeFile(
                    path.join(cwd, 'package.json'),
                    JSON.stringify({
                        name: 'app',
                        devDependencies: { 'arui-presets-lint': '11.2.0' },
                        ...(migrate
                            ? {
                                  commitlint: {
                                      extends:
                                          './node_modules/arui-presets-lint/commitlint/index.js',
                                      rules: { 'header-max-length': [2, 'always', 45] },
                                  },
                              }
                            : {}),
                    }),
                );
                await applySetup(cwd, await planSetup(cwd, migrate));
                const valid = await lintCommit(cwd, 'feat(app): valid message');
                assert.equal(valid.exitCode, 0, valid.stderr);
                assert.equal((await lintCommit(cwd, 'invalid message')).exitCode, 1);
                if (migrate) {
                    const long = await lintCommit(cwd, `feat(app): ${'a'.repeat(50)}`);
                    assert.equal(long.exitCode, 1);
                    assert.match(long.stdout, /header-max-length/);
                }
                assert.equal((await planSetup(cwd, migrate)).edits.length, 0);
            });
        },
    );

    it('сохраняет настройки package.yaml и сообщает о ручной проверке', async () => {
        await withProject(async (cwd) => {
            const settings = {
                prettier: { tabWidth: 2, singleQuote: false },
                commitlint: { rules: { 'header-max-length': [2, 'always', 45] } },
            };
            const yaml = JSON.stringify(settings);
            await writeFile(path.join(cwd, 'package.yaml'), yaml);
            const file = path.join(cwd, 'index.js');
            assert.deepEqual(
                await prettier.resolveConfig(file, { useCache: false }),
                settings.prettier,
            );
            assert.equal((await lintCommit(cwd, 'feat(app): valid message')).exitCode, 0);
            const plan = await planSetup(cwd, true);
            await applySetup(cwd, plan);
            assert.match(plan.warnings.join('\n'), /package.yaml/);
            assert.deepEqual(
                await prettier.resolveConfig(file, { useCache: false }),
                settings.prettier,
            );
            assert.equal((await lintCommit(cwd, 'feat(app): valid message')).exitCode, 0);
            const pkg = await readManifest(cwd);
            assert.equal(pkg.prettier, undefined);
            assert.equal(pkg.commitlint, undefined);
            assert.equal(await readFile(path.join(cwd, 'package.yaml'), 'utf8'), yaml);
        });
    });
});
