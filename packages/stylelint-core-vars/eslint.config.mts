import { defineConfig, eslintConfig } from 'arui-presets-lint/eslint';
import path from 'node:path';

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
                        'vitest.config.ts',
                        'vitest.setup.ts',
                        'eslint.config.mts',
                    ],
                    // Пакет линтуется общими инструментами монорепозитория:
                    // arui-presets-lint объявлен в devDependencies корня,
                    // поэтому учитываем зависимости обоих манифестов
                    packageDir: [import.meta.dirname, path.join(import.meta.dirname, '../..')],
                },
            ],
            'import-x/no-useless-path-segments': 'off',
        },
    },
    {
        files: ['lib/**/*.ts'],
        rules: {
            'no-console': 'off',
            'max-params': 'off',
            '@typescript-eslint/max-params': 'off',
            'max-lines': 'off',
            'unicorn/no-useless-undefined': 'off',
        },
    },
    {
        files: ['test/**/*.ts'],
        rules: {
            'max-lines': 'off',
        },
    },
]);
