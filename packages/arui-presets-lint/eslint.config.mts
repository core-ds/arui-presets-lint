import path from 'node:path';

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
                    // import-x разрешает относительные паттерны от cwd, а не от каталога конфига.
                    devDependencies: [
                        'test/**/*',
                        '_internal/**/*',
                        'vitest.config.ts',
                        'scripts/**/*',
                    ].map((pattern) => path.join(import.meta.dirname, pattern)),
                },
            ],
            'import-x/no-useless-path-segments': 'off',
            'no-console': 'off',
            'max-lines': ['error', 1000],
        },
    },
]);
