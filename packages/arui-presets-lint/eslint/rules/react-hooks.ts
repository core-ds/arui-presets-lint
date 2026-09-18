import { type Linter } from 'eslint';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

import { GLOBAL_SCRIPTS_SCOPE } from '../constants.js';

export const reactHooksConfig: Linter.Config = {
    ...reactHooksPlugin.configs.flat['recommended-latest'],

    name: 'arui-presets-lint/react-hooks',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'react-hooks': reactHooksPlugin,
    } as Linter.Config['plugins'],

    rules: {
        ...reactHooksPlugin.configs.flat['recommended-latest'].rules,

        // Правила хуков (обязательные)
        // https://react.dev/reference/rules/rules-of-hooks
        'react-hooks/rules-of-hooks': 'error',

        // Проверка списка зависимостей для хуков типа useEffect и др.
        // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks#advanced-configuration
        'react-hooks/exhaustive-deps': 'error',
    },
};
