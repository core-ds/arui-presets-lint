import { defineConfig } from './eslint/config.js';
import { eslintConfig } from './eslint/index.js';

export default defineConfig(eslintConfig, [
    {
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['test/**/*', 'cli/duplicates-checker.ts'],
                },
            ],
            'import-x/no-useless-path-segments': 'off',
            'no-console': 'off',
            'max-lines': ['error', 1000],
        },
    },
]);
