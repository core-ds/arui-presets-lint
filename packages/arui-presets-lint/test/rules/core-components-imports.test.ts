import { createRuleTester } from 'eslint-vitest-rule-tester';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import { CORE_COMPONENTS_PACKAGE } from '../../eslint/plugins/core-components/constants/index.js';
import { coreComponentsImportRule } from '../../eslint/plugins/core-components/rule/index.js';

const testerConfig = {
    linterOptions: {
        reportUnusedDisableDirectives: false,
    },
    configs: {
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                sourceType: 'module' as const,
                ecmaVersion: 2022 as const,
            },
        },
    },
};

const splitComponentsNames = ['button', 'modal', 'select'];

const { valid, invalid } = createRuleTester({
    ...testerConfig,
    name: 'core-components-imports',
    rule: coreComponentsImportRule,
});

describe('core-components-imports', () => {
    describe('valid', () => {
        it.each([...splitComponentsNames])(
            'не сообщает об ошибке при платформенном импорте %s',
            async (component) => {
                await valid({
                    code: `import { ${component}Desktop } from '${CORE_COMPONENTS_PACKAGE}/${component}/desktop';`,
                });
            },
        );

        it('не сообщает об ошибке при мобильном платформенном импорте', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components/button/mobile';",
            });
        });

        it('не сообщает об ошибке при импорте компонента без разделения на платформы', async () => {
            await valid({
                code: "import { Link } from '@alfalab/core-components/link';",
            });
        });

        it('не сообщает об ошибке при импорте корня агрегатора без компонента', async () => {
            await valid({
                code: "import { setup } from '@alfalab/core-components';",
            });
        });

        it('не сообщает об ошибке при импорте постороннего пакета', async () => {
            await valid({
                code: "import { Button } from 'some-lib';",
            });
        });

        it('не сообщает об ошибке при импорте только типов с корня пакета', async () => {
            await valid({
                code: "import { type ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке, когда все спецификаторы импорта - типы', async () => {
            await valid({
                code: "import { type ButtonProps, type ButtonData } from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке при нескольких type-спецификаторах без import type', async () => {
            await valid({
                code: "import { type ButtonProps, type CommonButtonProps } from '@alfalab/core-components-button';",
            });
        });

        it('не сообщает об ошибке при экспорте только типов с корня пакета', async () => {
            await valid({
                code: "export type { ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке при export type * из компонента с разделением на платформы', async () => {
            await valid({
                code: "export type * from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке при export type * as ns из компонента с разделением на платформы', async () => {
            await valid({
                code: "export type * as buttonNs from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке при inline-export только типов', async () => {
            await valid({
                code: "export { type ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it('не сообщает об ошибке при платформенном импорте из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components-button/desktop';",
            });
        });

        it('не сообщает об ошибке при мобильном импорте из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components-button/mobile';",
            });
        });

        it('не сообщает об ошибке при импорте отдельного пакета без разделения на платформы', async () => {
            await valid({
                code: "import { Accordion } from '@alfalab/core-components-accordion';",
            });
        });

        it('не сообщает об ошибке при динамическом import() с платформенным путём', async () => {
            await valid({
                code: "const { ButtonMobile } = await import('@alfalab/core-components/button/mobile');",
            });
        });

        it('не сообщает об ошибке при import type из компонента с разделением на платформы', async () => {
            await valid({
                code: "import type { ButtonProps } from '@alfalab/core-components/button';",
            });
        });
    });

    describe('invalid', () => {
        it('сообщает об ошибке при импорте с корня компонента с разделением на платформы', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
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

        it('сообщает об ошибке при импорте из отдельного пакета без платформы', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components-button';",
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

        it('сообщает об ошибке при export ... from компонента с разделением на платформы', async () => {
            await invalid({
                code: "export { Button } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при export * from компонента с разделением на платформы', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при side-effect импорте компонента с разделением на платформы', async () => {
            await invalid({
                code: "import '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при динамическом import() с корня компонента с разделением на платформы', async () => {
            await invalid({
                code: "const { Button } = await import('@alfalab/core-components/button');",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при export * as ns из компонента с разделением на платформы', async () => {
            await invalid({
                code: "export * as buttonNs from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при импорте с явным суффиксом /index', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button/index';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при смешанном импорте значения и типа с корня', async () => {
            await invalid({
                code: "import { Button, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при смешанном импорте нескольких значений и типа', async () => {
            await invalid({
                code: "import { Button, ButtonLoader, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при экспорте нескольких значений с типом', async () => {
            await invalid({
                code: "export { Button, ButtonLoader, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it.each([...splitComponentsNames])(
            'сообщает об ошибке при импорте %s с корня',
            async (component) => {
                await invalid({
                    code: `import { ${component} } from '${CORE_COMPONENTS_PACKAGE}/${component}';`,
                    errors: [{ messageId: 'missingPlatform' }],
                });
            },
        );
    });

    describe('runtime-скан (autodetect из node_modules)', () => {
        // Правило само определяет разделенные по платформам компоненты по установленной в node_modules
        // версии @alfalab/core-components. В проде правило резолвит пакет относительно
        // линтуемого файла, поэтому здесь опираемся на установленную devDependency.
        it('сообщает об ошибке для компонента с разделением на платформы, определённого из node_modules', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('не сообщает об ошибке при платформенном импорте в runtime-скане', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components/button/desktop';",
            });
        });
    });

    describe('splitComponents', () => {
        it('сообщает об ошибке для компонента из ручного списка', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents: ['button'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('не сообщает об ошибке для компонента вне ручного списка, даже если он есть в node_modules', async () => {
            await valid({
                code: "import { Accordion } from '@alfalab/core-components/accordion';",
                options: [{ splitComponents: ['button'] }],
            });
        });

        it('не сообщает об ошибке для компонента, вычтенного excludeSplitComponents из ручного списка', async () => {
            await valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents: ['button', 'select'], excludeSplitComponents: ['button'] }],
            });
        });
    });

    describe('excludeSplitComponents', () => {
        it('не сообщает об ошибке для компонента, исключённого при runtime-скане', async () => {
            await valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ excludeSplitComponents: ['button'] }],
            });
        });

        it('не сообщает об ошибке для компонента, исключённого из autodetect', async () => {
            await valid({
                code: "import { Select } from '@alfalab/core-components/select';",
                options: [{ excludeSplitComponents: ['select'] }],
            });
        });

        it('сообщает об ошибке, если в исключения передан полный путь пакета, а не имя компонента', async () => {
            await invalid({
                code: "import { Select } from '@alfalab/core-components/select';",
                options: [{ excludeSplitComponents: ['@alfalab/core-components-select'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке для остальных компонентов, не попавших в исключения', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ excludeSplitComponents: ['select'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });
    });
});
