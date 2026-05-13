import { defineConfig, eslintConfig } from './eslint/index.js';

export default defineConfig(eslintConfig, [
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: [
                        'test/**/*',
                        '_internal/**/*',
                        'vitest.config.ts',
                        'scripts/**/*',
                    ],
                },
            ],
            'import-x/no-useless-path-segments': 'off',
            'no-console': 'off',
            'max-lines': ['error', 1000],
        },
    },
]);
