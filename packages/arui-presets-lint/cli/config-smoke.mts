#!/usr/bin/env node
/**
 * Интеграционная проверка: ESLint и Stylelint с текущими конфигами применимы к фикстурам.
 * Ловит «Unknown rule», забытый плагин и несовместимость версий без отдельных юнит-тестов.
 */
import { execa } from 'execa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheFolder = path.join(packageRoot, 'node_modules/.cache/stylelint');
const stylelintIgnore = path.join(packageRoot, 'cli/stylelint-smoke.ignore');

const eslintTargets = [
    'smoke/config-smoke.tsx',
    'test/ts-input.tsx',
    'test/js-input.jsx',
    'test/types/index.ts',
    'test/types/types.ts',
];

const stylelintTargets = ['smoke/config-smoke.css', 'test/css-input.css', 'test/test.module.css'];

await execa('eslint', eslintTargets, {
    cwd: packageRoot,
    preferLocal: true,
    stdio: 'inherit',
});

await execa(
    'stylelint',
    [
        ...stylelintTargets,
        '--allow-empty-input',
        '--ignore-path',
        stylelintIgnore,
        '--cache',
        `--cache-location=${path.join(cacheFolder, '.stylelintcache-smoke')}`,
    ],
    {
        cwd: packageRoot,
        preferLocal: true,
        stdio: 'inherit',
    },
);
