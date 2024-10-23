#! /usr/bin/env node

import { execaCommand } from 'execa';

const prettierParams = '"./**/*.{ts,tsx,js,jsx,css,json}" --no-error-on-unmatched-pattern';

const commandsMap = {
    lint: `yarn lint:css && yarn lint:scripts && prettier --check ${prettierParams}`,
    fix: `yarn lint:css --fix && yarn lint:scripts --fix && prettier --write ${prettierParams}`,
    css: 'stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore --cache',
    scripts:
        'eslint "**/*.{js,jsx,ts,tsx}" --ext .js,.jsx,.ts,.tsx --ignore-pattern=.gitignore,.eslintignore --cache',
    run: (...args) => args.join(' '),
};

const commands = Object.keys(commandsMap);
const command = process.argv[2];
const commandValue = commandsMap[command];
const args = process.argv.slice(3);

let exec;

if (!command || !commands.includes(command)) {
    // eslint-disable-next-line no-console
    console.error(`Please specify one of available commands: ${commands.join(' ')}`);

    process.exit(-1);
}

if (typeof commandValue === 'function') {
    exec = commandValue(...args);
} else {
    exec = [commandValue, ...args].join(' ');
}

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
