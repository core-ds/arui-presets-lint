import { type Linter } from 'eslint';
import noSecretsPlugin from 'eslint-plugin-no-secrets';

export const noSecretsConfig: Linter.Config = {
    name: 'arui-presets-lint/no-secrets',
    plugins: {
        'no-secrets': noSecretsPlugin,
    },
    rules: {
        // Обнаружение потенциальных секретов и ключей в строковых литералах и комментариях
        // https://github.com/nickdeis/eslint-plugin-no-secrets
        'no-secrets/no-secrets': 'error',
    },
};
