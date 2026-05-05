import { defineConfig, globalIgnores } from 'arui-presets-lint/eslint';
import turboConfig from 'eslint-config-turbo/flat';

export default defineConfig(
    [globalIgnores(['**/test-data/**', '.publish', 'turbo', 'coverage', '.yarn'])],
    turboConfig,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            'import-x/no-unused-modules': 'off',
            'no-console': 'off',
        },
    },
);
