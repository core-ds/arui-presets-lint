import { type Linter } from 'eslint';
import reactYouMightNotNeedAnEffect from 'eslint-plugin-react-you-might-not-need-an-effect';

import { GLOBAL_SCRIPTS_SCOPE } from '../constants.js';

export const reactYouMightNotNeedAnEffectConfig: Linter.Config = {
    name: 'arui-presets-lint/react-you-might-not-need-an-effect',
    files: [GLOBAL_SCRIPTS_SCOPE],
    plugins: {
        'react-you-might-not-need-an-effect': reactYouMightNotNeedAnEffect,
    },

    rules: {
        // https://github.com/nickjvandyke/eslint-plugin-react-you-might-not-need-an-effect#rules
        ...reactYouMightNotNeedAnEffect.configs.recommended.rules,
    },
};
