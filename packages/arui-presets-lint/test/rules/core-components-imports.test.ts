import tsParser from '@typescript-eslint/parser';
import { createRuleTester } from 'eslint-vitest-rule-tester';
import { describe, it } from 'vitest';

import { CORE_COMPONENTS_PACKAGE } from '../../eslint/plugins/core-components/constants/index.js';
import { coreComponentsImportRule } from '../../eslint/plugins/core-components/rule/index.js';

const testerConfig = {
    linterOptions: {
        reportUnusedDisableDirectives: false,
    },
    configs: {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                sourceType: 'module' as const,
                ecmaVersion: 2022 as const,
            },
        },
    },
};

const splitComponents = ['button', 'modal', 'select'];

const { valid, invalid } = createRuleTester({
    ...testerConfig,
    name: 'core-components-imports',
    rule: coreComponentsImportRule,
});

describe('core-components-imports', () => {
    describe('valid', () => {
        it.each([...splitComponents])('принимает платформенный импорт %s', async (component) => {
            await valid({
                code: `import { ${component}Desktop } from '${CORE_COMPONENTS_PACKAGE}/${component}/desktop';`,
                options: [{ splitComponents }],
            });
        });

        it('принимает мобильный платформенный импорт', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components/button/mobile';",
                options: [{ splitComponents }],
            });
        });

        it('принимает импорт несвязанного пакета', async () => {
            await valid({
                code: "import { Link } from '@alfalab/core-components/link';",
                options: [{ splitComponents }],
            });
        });

        it('принимает импорт корня агрегатора без компонента', async () => {
            await valid({
                code: "import { setup } from '@alfalab/core-components';",
                options: [{ splitComponents }],
            });
        });

        it('принимает импорт постороннего пакета', async () => {
            await valid({
                code: "import { Button } from 'some-lib';",
                options: [{ splitComponents }],
            });
        });

        it('принимает импорт только типов с корня пакета', async () => {
            await valid({
                code: "import { type ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
            });
        });

        it('принимает экспорт только типов с корня пакета', async () => {
            await valid({
                code: "export type { ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
            });
        });

        it('принимает платформенный импорт из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components-button/desktop';",
                options: [{ splitComponents }],
            });
        });

        it('принимает мобильный импорт из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components-button/mobile';",
                options: [{ splitComponents }],
            });
        });

        it('принимает импорт отдельного пакета без разделения desktop/mobile', async () => {
            await valid({
                code: "import { Accordion } from '@alfalab/core-components-accordion';",
                options: [{ splitComponents }],
            });
        });
    });

    describe('invalid', () => {
        it('помечает импорт с корня сплит-компонента как ошибку', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [
                    {
                        messageId: 'missingPlatform',
                        data: {
                            component: 'button',
                            suggestedDesktop: '@alfalab/core-components/button/desktop',
                            suggestedMobile: '@alfalab/core-components/button/mobile',
                        },
                    },
                ],
            });
        });

        it('помечает импорт сплит-компонента из отдельного пакета без платформы как ошибку', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components-button';",
                options: [{ splitComponents }],
                errors: [
                    {
                        messageId: 'missingPlatform',
                        data: {
                            component: 'button',
                            suggestedDesktop: '@alfalab/core-components-button/desktop',
                            suggestedMobile: '@alfalab/core-components-button/mobile',
                        },
                    },
                ],
            });
        });

        it('помечает export from сплит-компонента как ошибку', async () => {
            await invalid({
                code: "export { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает export * from сплит-компонента как ошибку', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает импорт с /index как ошибку', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button/index';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает смешанный импорт значения и типа с корня как ошибку', async () => {
            await invalid({
                code: "import { Button, type ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('принимает import type из компонента с разделением desktop/mobile', async () => {
            await valid({
                code: "import type { ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
            });
        });

        it.each([...splitComponents])('помечает импорт %s с корня как ошибку', async (component) => {
            await invalid({
                code: `import { ${component} } from '${CORE_COMPONENTS_PACKAGE}/${component}';`,
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });
    });

    describe('runtime-скан (без опции splitComponents)', () => {
        // Правило само определяет сплит-компоненты по установленной в node_modules
        // версии @alfalab/core-components. В проде правило резолвит пакет относительно
        // линтуемого файла, поэтому здесь опираемся на установленную devDependency.
        it('помечает сплит-компонент, определённый из node_modules, как ошибку', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('принимает платформенный импорт при runtime-скане', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components/button/desktop';",
            });
        });
    });
});
