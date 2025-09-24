import { type TSESLint } from '@typescript-eslint/utils';
import globals from 'globals';

export const testsConfig: TSESLint.FlatConfig.Config = {
    name: 'arui-presets-lint/tests',
    files: ['**/*.{test,tests,spec}.{js,jsx,ts,tsx,cjs,cts,mjs,mts}'],
    languageOptions: {
        globals: {
            ...globals.jest,
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
