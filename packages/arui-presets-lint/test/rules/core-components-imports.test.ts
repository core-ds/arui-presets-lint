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

const splitComponentsNames = ['button', 'modal', 'select'];

const { valid, invalid } = createRuleTester({
    ...testerConfig,
    name: 'core-components-imports',
    rule: coreComponentsImportRule,
});

describe('core-components-imports', () => {
    describe('valid', () => {
        it.each([...splitComponentsNames])('принимает платформенный импорт %s', async (component) => {
            await valid({
                code: `import { ${component}Desktop } from '${CORE_COMPONENTS_PACKAGE}/${component}/desktop';`,
            });
        });

        it('принимает мобильный платформенный импорт', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components/button/mobile';",
            });
        });

        it('принимает импорт несвязанного пакета', async () => {
            await valid({
                code: "import { Link } from '@alfalab/core-components/link';",
            });
        });

        it('принимает импорт корня агрегатора без компонента', async () => {
            await valid({
                code: "import { setup } from '@alfalab/core-components';",
            });
        });

        it('принимает импорт постороннего пакета', async () => {
            await valid({
                code: "import { Button } from 'some-lib';",
            });
        });

        it('принимает импорт только типов с корня пакета', async () => {
            await valid({
                code: "import { type ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it('принимает импорт, где все спецификаторы - типы', async () => {
            await valid({
                code: "import { type ButtonProps, type ButtonData } from '@alfalab/core-components/button';",
            });
        });

        it('принимает несколько type-спецификаторов без import type', async () => {
            await valid({
                code: "import { type ButtonProps, type CommonButtonProps } from '@alfalab/core-components-button';",
            });
        });

        it('принимает экспорт только типов с корня пакета', async () => {
            await valid({
                code: "export type { ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it('принимает export type * из сплит-компонента', async () => {
            await valid({
                code: "export type * from '@alfalab/core-components/button';",
            });
        });

        it('принимает export type * as ns из сплит-компонента', async () => {
            await valid({
                code: "export type * as buttonNs from '@alfalab/core-components/button';",
            });
        });

        it('принимает платформенный импорт из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components-button/desktop';",
            });
        });

        it('принимает мобильный импорт из отдельного пакета', async () => {
            await valid({
                code: "import { ButtonMobile } from '@alfalab/core-components-button/mobile';",
            });
        });

        it('принимает импорт отдельного пакета без разделения desktop/mobile', async () => {
            await valid({
                code: "import { Accordion } from '@alfalab/core-components-accordion';",
            });
        });
    });

    describe('invalid', () => {
        it('помечает импорт с корня сплит-компонента как ошибку', async () => {
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

        it('помечает импорт сплит-компонента из отдельного пакета без платформы как ошибку', async () => {
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

        it('помечает export from сплит-компонента как ошибку', async () => {
            await invalid({
                code: "export { Button } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает export * from сплит-компонента как ошибку', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает side-effect импорт сплит-компонента как ошибку', async () => {
            await invalid({
                code: "import '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает export * as ns из сплит-компонента как ошибку', async () => {
            await invalid({
                code: "export * as buttonNs from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает импорт с /index как ошибку', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button/index';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает смешанный импорт значения и типа с корня как ошибку', async () => {
            await invalid({
                code: "import { Button, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает смешанный импорт нескольких значений и типа как ошибку', async () => {
            await invalid({
                code: "import { Button, ButtonLoader, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('помечает экспорт нескольких значений с типом как ошибку', async () => {
            await invalid({
                code: "export { Button, ButtonLoader, type ButtonProps } from '@alfalab/core-components/button';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('принимает import type из компонента с разделением desktop/mobile', async () => {
            await valid({
                code: "import type { ButtonProps } from '@alfalab/core-components/button';",
            });
        });

        it.each([...splitComponentsNames])('помечает импорт %s с корня как ошибку', async (component) => {
            await invalid({
                code: `import { ${component} } from '${CORE_COMPONENTS_PACKAGE}/${component}';`,
                errors: [{ messageId: 'missingPlatform' }],
            });
        });
    });

    describe('runtime-скан (autodetect из node_modules)', () => {
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

    describe('splitComponents', () => {
        it('полностью заменяет автоопределение: компоненты из списка помечаются', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents: ['button'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('компонент вне списка не помечается, даже если он сплитнут в node_modules', async () => {
            await valid({
                code: "import { Accordion } from '@alfalab/core-components/accordion';",
                options: [{ splitComponents: ['button'] }],
            });
        });

        it('exclude вычитается из ручного списка splitComponents', async () => {
            await valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents: ['button', 'select'], excludeSplitComponents: ['button'] }],
            });
        });
    });

    describe('excludeSplitComponents', () => {
        it('исключает компонент из проверки при runtime-скане', async () => {
            await valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ excludeSplitComponents: ['button'] }],
            });
        });

        it('исключает сплит-компонент из autodetect', async () => {
            await valid({
                code: "import { Select } from '@alfalab/core-components/select';",
                options: [{ excludeSplitComponents: ['select'] }],
            });
        });

        it('полное имя пакета не является исключением (принимаются только имена компонентов)', async () => {
            await invalid({
                code: "import { Select } from '@alfalab/core-components/select';",
                options: [{ excludeSplitComponents: ['@alfalab/core-components-select'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('не влияет на остальные сплит-компоненты', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ excludeSplitComponents: ['select'] }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });
    });
});
