#! /usr/bin/env node

import { execaCommand } from 'execa';

const prettierParams = '"./**/*.{ts,tsx,js,jsx,css,json}" --no-error-on-unmatched-pattern';

const commandsMap = {
    lint: `yarn lint:css && yarn lint:scripts && prettier --check ${prettierParams}`,
    fix: `yarn lint:css --fix && yarn lint:scripts --fix && prettier --write ${prettierParams}`,
    css: 'stylelint "**/*.css" --allow-empty-input --ignore-path .gitignore --ignore-path .stylelintignore',
    scripts:
        'eslint "**/*.{js,jsx,ts,tsx}" --ext .js,.jsx,.ts,.tsx --ignore-pattern=.gitignore,.eslintignore',
    commit: 'commitlint',
    stage: 'lint-staged',
};

const command = process.argv[2];
const args = process.argv.slice(3);

const exec = [commandsMap[command], ...args].join(' ');

// eslint-disable-next-line no-console
console.log(exec);

await execaCommand(exec, {
    shell: true,
    stdio: ['pipe', 'inherit', 'inherit'],
    preferLocal: true,
});
