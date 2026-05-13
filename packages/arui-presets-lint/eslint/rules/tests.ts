import { type Linter } from 'eslint';
import globals from 'globals';

import { TESTS_SCRIPTS_SCOPE } from '../constants.js';

export const testsConfig: Linter.Config = {
    name: 'arui-presets-lint/tests',
    files: [TESTS_SCRIPTS_SCOPE],
    languageOptions: {
        globals: {
            ...globals.jest,
            ...globals.vitest,
        },
    },
    rules: {
        // Правила для запрета использования свойств в объектах
        // https://eslint.org/docs/latest/rules/no-restricted-properties
        'no-restricted-properties': [
            'error',
            {
                object: 'it',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'describe',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'context',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
            {
                object: 'test',
                property: 'only',
                message: "Did you forget to remove 'only' from this test?",
            },
        ],
    },
};
