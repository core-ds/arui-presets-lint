#!/usr/bin/env node

import { execaCommand } from 'execa';

const prettierParams =
    '"./**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json}" --no-error-on-unmatched-pattern --cache';
const cacheFolder = './node_modules/.cache';

const commandsMap = {
    styles: `stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore --cache --cache-location="${cacheFolder}/stylelint/.stylelintcache"`,
    scripts: 'eslint .',
    format: `prettier --write ${prettierParams} --list-different`,
    'format:check': `prettier --check ${prettierParams}`,
};

const commands = Object.keys(commandsMap);
const enableEcho = process.argv[2] === '--echo';
const command = enableEcho ? process.argv[3] : process.argv[2];

if (!command || !commands.includes(command)) {
    console.error(`Please specify one of available commands: ${commands.join(' ')}`);

    process.exit(-1);
}

const args = enableEcho ? process.argv.slice(4) : process.argv.slice(3);

const exec = [commandsMap[command], ...args].join(' ');

if (enableEcho) {
    console.log('>>', exec);
}

try {
    await execaCommand(exec, {
        shell: true,
        preferLocal: true,
        stdio: ['pipe', 'inherit', 'inherit'],
    });
} catch (error) {
    console.error(error.message);
    process.exit(error.exitCode);
}
