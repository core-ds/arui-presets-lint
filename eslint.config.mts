import { defineConfig } from './eslint/config';
import { eslintConfig } from './eslint';

export default defineConfig(eslintConfig, [
    {
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['test/**/*', 'cli/duplicates-checker.ts'],
                },
            ],
            'no-console': 'off',
            'max-lines': ['error', 1000],
        },
        linterOptions: {
            reportUnusedDisableDirectives: "off",
        }
    },
]);
