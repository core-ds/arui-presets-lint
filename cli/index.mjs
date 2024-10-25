#! /usr/bin/env node

import { execaCommand } from 'execa';

const prettierParams =
    '"./**/*.{ts,tsx,js,jsx,mjs,mts,cjs,cts,css,json}" --no-error-on-unmatched-pattern --cache';

const commandsMap = {
    styles: 'stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore --cache --cache-location="./node_modules/.cache/stylelint/.stylelintcache"',
    scripts:
        'eslint "**/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}" --ext .js,.jsx,.ts,.tsx,.mjs,.mts,.cjs,.cts --ignore-pattern=.gitignore,.eslintignore --cache --cache-location="./node_modules/.cache/eslint/.eslintcache"',
    format: `prettier --write ${prettierParams}`,
    'format:check': `prettier --check ${prettierParams}`,
};

const commands = Object.keys(commandsMap);
const command = process.argv[2];
const args = process.argv.slice(3);

const exec =
    !command || !commands.includes(command)
        ? `${command} ${args.join(' ')}`
        : [commandsMap[command], ...args].join(' ');

// eslint-disable-next-line no-console
console.log(exec);

try {
    await execaCommand(exec, {
        shell: true,
        preferLocal: true,
        stdio: ['pipe', 'inherit', 'inherit'],
    });
} catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message);
    process.exit(error.exitCode);
}
