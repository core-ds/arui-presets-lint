import { intersection } from 'es-toolkit/array';

import { disableCommentsConfig } from '../eslint/plugins/disable-comments';
import { importsConfig } from '../eslint/rules/imports';
import { nodeRulesConfig } from '../eslint/rules/node';
import { reactConfig } from '../eslint/rules/react';
import { reactA11yConfig } from '../eslint/rules/react-a11y';
import { testsConfig } from '../eslint/rules/tests';
import { typescriptConfig } from '../eslint/rules/typescript';
import { variablesConfig } from '../eslint/rules/variables';

const imports = { rules: Object.keys(importsConfig.rules || {}), name: importsConfig.name };
const node = { rules: Object.keys(nodeRulesConfig.rules || {}), name: nodeRulesConfig.name };
const react = { rules: Object.keys(reactConfig.rules || {}), name: reactConfig.name };
const reactA11y = { rules: Object.keys(reactA11yConfig.rules || {}), name: reactA11yConfig.name };
const tests = { rules: Object.keys(testsConfig.rules || {}), name: testsConfig.name };
const typescript = {
    rules: Object.keys(typescriptConfig.rules || {}),
    name: typescriptConfig.name,
    // Для этих правил пересечения допустимы
    ignore: [
        'class-methods-use-this',
        'consistent-return',
        'default-param-last',
        'dot-notation',
        'init-declarations',
        'max-params',
        'no-array-constructor',
        'no-dupe-class-members',
        'no-empty-function',
        'no-implied-eval',
        'no-invalid-this',
        'no-loop-func',
        'no-loss-of-precision',
        'no-magic-numbers',
        'no-redeclare',
        'no-restricted-imports',
        'no-shadow',
        'no-unused-expressions',
        'no-unused-vars',
        'no-use-before-define',
        'no-useless-constructor',
        'only-throw-error',
        'prefer-destructuring',
        'prefer-promise-reject-errors',
        'require-await',
        'no-undef',
        'import-x/named',
        'prefer-const',
    ],
};
const variables = { rules: Object.keys(variablesConfig.rules || {}), name: variablesConfig.name };
const disableComments = {
    rules: Object.keys(disableCommentsConfig.rules || {}),
    name: disableCommentsConfig.name,
};

const configs: Array<{
    rules: string[];
    name?: string;
    ignore?: string;
}> = [imports, node, react, reactA11y, tests, typescript, variables, disableComments];

const duplicates = [];

for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
        const config1 = configs[i];
        const config2 = configs[j];

        const intersectedRules = intersection(config1.rules, config2.rules).filter(
            (rule) => ![...(config1.ignore || []), ...(config2.ignore || [])].includes(rule),
        );

        if (intersectedRules.length > 0) {
            duplicates.push({
                entities: [config1.name, config2.name],
                rules: intersectedRules,
            });
        }
    }
}

if (duplicates.length > 0) {
    console.log(
        `🚨 Найдены дубликаты в наборах правил eslint, в количестве: ${duplicates.length} `,
    );

    for (const { entities, rules } of duplicates) {
        console.log(
            `Пересечение между "${entities[0]}" и "${entities[1]}": ${rules.length} правил...`,
        );
        console.log('Правила:', rules.join(', '));
        console.log('---');
    }

    console.log('Удалите дубликаты и попробуйте снова!');
    process.exit(2);
}
