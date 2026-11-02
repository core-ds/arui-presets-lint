import { type Linter } from 'eslint';
import reactPlugin from 'eslint-plugin-react-x';

import { GLOBAL_SCRIPTS_SCOPE } from '../constants.js';

export const reactHooksConfig: Linter.Config = {
    name: 'arui-presets-lint/react-hooks',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'react-x': reactPlugin,
    },

    rules: {
        // Правила хуков (обязательные)
        // https://eslint-react.xyz/docs/rules/rules-of-hooks
        'react-x/rules-of-hooks': 'error',

        // Проверка списка зависимостей для хуков типа useEffect и др.
        // https://eslint-react.xyz/docs/rules/exhaustive-deps
        'react-x/exhaustive-deps': 'error',

        // Компоненты должны объявляться вне рендера
        // https://eslint-react.xyz/docs/rules/static-components
        'react-x/static-components': 'error',

        // Проверяет callback useMemo и использование его результата
        // https://eslint-react.xyz/docs/rules/use-memo
        'react-x/use-memo': 'error',

        // Запрещает мутации пропсов и состояния
        // https://eslint-react.xyz/docs/rules/immutability
        'react-x/immutability': 'error',

        // Запрещает мутации глобальных значений во время рендера
        // https://eslint-react.xyz/docs/rules/globals
        'react-x/globals': 'error',

        // Запрещает чтение и запись ref.current во время рендера
        // https://eslint-react.xyz/docs/rules/refs
        'react-x/refs': 'error',

        // Запрещает синхронный setState в эффектах
        // https://eslint-react.xyz/docs/rules/set-state-in-effect
        'react-x/set-state-in-effect': 'error',

        // Требует Error Boundary вместо try/catch вокруг рендера
        // https://eslint-react.xyz/docs/rules/error-boundaries
        'react-x/error-boundaries': 'error',

        // Запрещает нечистые операции во время рендера
        // https://eslint-react.xyz/docs/rules/purity
        'react-x/purity': 'error',

        // Запрещает безусловный setState во время рендера
        // https://eslint-react.xyz/docs/rules/set-state-in-render
        'react-x/set-state-in-render': 'error',

        // Предупреждает о синтаксисе, который не поддерживает React Compiler
        // https://eslint-react.xyz/docs/rules/unsupported-syntax
        'react-x/unsupported-syntax': 'warn',
    },
};
