import { type Linter } from 'eslint';

import { GLOBAL_SCRIPTS_SCOPE, REACT_SCRIPTS_SCOPE } from '../../constants.js';

import { designSystemPlugin } from './plugin.js';
import { type DesignSystemOptions } from './types.js';

export function createDesignSystemConfig(options: DesignSystemOptions = {}): Linter.Config[] {
    return [
        {
            name: 'arui-presets-lint/design-system-plugin',
            plugins: {
                'design-system': designSystemPlugin as NonNullable<
                    Linter.Config['plugins']
                >[string],
            },
        },

        {
            name: 'arui-presets-lint/design-system-api',
            files: [GLOBAL_SCRIPTS_SCOPE],
            rules: { 'design-system/no-deprecated-api': ['error', options.deprecatedApis ?? []] },
        },

        {
            name: 'arui-presets-lint/design-system-jsx',
            files: [REACT_SCRIPTS_SCOPE],
            rules: {
                'design-system/no-deprecated-props': ['error', options.deprecatedProps ?? []],
                'design-system/require-accessible-name': ['error', options.accessibleNames ?? []],
            },
        },

        {
            name: 'arui-presets-lint/design-system-deprecated-components',
            files: ['**/*.{tsx,mtsx,ctsx}'],
            rules: {
                'design-system/no-deprecated-components':
                    options.deprecatedComponents === false
                        ? 'off'
                        : ['warn', options.deprecatedComponents ?? {}],
            },
        },
    ];
}
