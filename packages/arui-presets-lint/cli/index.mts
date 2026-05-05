#!/usr/bin/env node

import { execaCommand, ExecaError } from 'execa';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const prettierParams =
    '"./**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json,mjsx,cjsx,mtsx,ctsx}" --no-error-on-unmatched-pattern --cache';
const cacheFolder = './node_modules/.cache';

const commandsMap = {
    styles: `stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore --cache --cache-location="${cacheFolder}/stylelint/.stylelintcache"`,
    scripts: 'eslint .',
    format: `prettier --write ${prettierParams} --list-different`,
    'format:check': `prettier --check ${prettierParams}`,
} as const;

const commands = Object.keys(commandsMap);
const enableEcho = process.argv[2] === '--echo';
const command = enableEcho ? process.argv[3] : process.argv[2];

if (!command || !commands.includes(command)) {
    console.error(`Please specify one of available commands: ${commands.join(' ')}`);

    process.exit(-1);
}

const args = enableEcho ? process.argv.slice(4) : process.argv.slice(3);

const exec = [commandsMap[command as keyof typeof commandsMap], ...args].join(' ');

if (enableEcho) {
    console.log('>>', exec);
}

try {
    await execaCommand(exec, {
        shell: true,
        preferLocal: true,
        localDir: packageRoot,
        stdio: ['pipe', 'inherit', 'inherit'],
    });
} catch (error: unknown) {
    if (error instanceof ExecaError) {
        console.error(error.message);
        process.exit(error.exitCode);
    } else {
        console.error('Unknown error');
        process.exit(1);
    }
}
