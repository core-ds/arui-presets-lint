import { type Linter } from 'eslint';

import { designSystemPlugin } from './plugin.js';
import { type DesignSystemOptions } from './types.js';

type FlatConfigPlugin = NonNullable<Linter.Config['plugins']>[string];

export function createDesignSystemConfig({
    deprecatedComponents,
}: DesignSystemOptions): Linter.Config[] {
    return [
        {
            name: 'arui-presets-lint/design-system-plugin',
            plugins: {
                'design-system': designSystemPlugin as FlatConfigPlugin,
            },
        },

        {
            name: 'arui-presets-lint/design-system-deprecated-components',
            files: ['**/*.{tsx,mtsx,ctsx}'],
            rules: {
                'design-system/no-deprecated-components': ['warn', deprecatedComponents],
            },
        },
    ];
}
