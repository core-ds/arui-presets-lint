import { defineConfig } from './eslint/config';
import { eslintConfig } from './eslint';

export default defineConfig(eslintConfig, [
    {
        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: ['test/**/*'],
                },
            ],
            'no-console': 'off',
            'max-lines': 'off',
        },
    },
]);
