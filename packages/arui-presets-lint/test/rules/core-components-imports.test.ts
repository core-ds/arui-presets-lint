import { createRuleTester } from 'eslint-vitest-rule-tester';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import tseslint from 'typescript-eslint';
import { afterAll, describe, it } from 'vitest';

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

        it('сообщает об ошибке при импорте с сегментом формата сборки esm', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button/esm';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при импорте из esm/index.js универсального входа', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button/esm/index.js';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при импорте из внутреннего подмодуля с корнем компонента', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button/shared';",
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('сообщает об ошибке при импорте с сегментом формата сборки esm из отдельного подпакета', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components-button/esm';",
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

    describe('автоопределение по форме импорта', () => {
        const formRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'core-components-form-'));

        const formTester = createRuleTester({
            ...testerConfig,
            name: 'core-components-imports',
            rule: coreComponentsImportRule,
            parserOptions: { tsconfigRootDir: formRoot },
        });

        afterAll(() => {
            fs.rmSync(formRoot, { recursive: true, force: true });
        });

        const createProject = ({
            aggregator = [],
            standalone = [],
            standaloneUnsplit = [],
        }: {
            aggregator?: string[];
            standalone?: string[];
            standaloneUnsplit?: string[];
        }): string => {
            const root = fs.mkdtempSync(path.join(formRoot, 'project-'));

            if (aggregator.length > 0) {
                const aggregateDir = path.join(root, 'node_modules', '@alfalab', 'core-components');
                fs.mkdirSync(aggregateDir, { recursive: true });
                fs.writeFileSync(
                    path.join(aggregateDir, 'package.json'),
                    JSON.stringify({ name: CORE_COMPONENTS_PACKAGE, version: '0.0.0' }),
                );

                for (const component of aggregator) {
                    fs.mkdirSync(path.join(aggregateDir, component, 'desktop'), {
                        recursive: true,
                    });
                    fs.mkdirSync(path.join(aggregateDir, component, 'mobile'), { recursive: true });
                }
            }

            for (const component of standalone) {
                const standaloneDir = path.join(
                    root,
                    'node_modules',
                    '@alfalab',
                    `core-components-${component}`,
                );
                fs.mkdirSync(path.join(standaloneDir, 'desktop'), { recursive: true });
                fs.mkdirSync(path.join(standaloneDir, 'mobile'), { recursive: true });
                fs.writeFileSync(
                    path.join(standaloneDir, 'package.json'),
                    JSON.stringify({
                        name: `@alfalab/core-components-${component}`,
                        version: '0.0.0',
                    }),
                );
            }

            for (const component of standaloneUnsplit) {
                const standaloneDir = path.join(
                    root,
                    'node_modules',
                    '@alfalab',
                    `core-components-${component}`,
                );
                fs.mkdirSync(standaloneDir, { recursive: true });
                fs.writeFileSync(path.join(standaloneDir, 'index.js'), '');
                fs.writeFileSync(
                    path.join(standaloneDir, 'package.json'),
                    JSON.stringify({
                        name: `@alfalab/core-components-${component}`,
                        version: '0.0.0',
                    }),
                );
            }

            const entry = path.join(root, 'entry.ts');
            fs.writeFileSync(entry, '');

            return entry;
        };

        it('сообщает об ошибке для standalone-импорта, разделённого только в отдельном подпакете', async () => {
            const filename = createProject({ aggregator: ['link'], standalone: ['button'] });

            await formTester.invalid({
                code: "import { Button } from '@alfalab/core-components-button';",
                filename,
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

        it('не сообщает об ошибке для агрегатор-импорта, не разделённого в агрегаторе', async () => {
            // Зеркальный случай: разделён только standalone-пакет, агрегатор — нет.
            const filename = createProject({ aggregator: ['link'], standalone: ['button'] });

            await formTester.valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                filename,
            });
        });

        it('сообщает об ошибке для standalone-импорта, когда разделены обе формы', async () => {
            const filename = createProject({ aggregator: ['button'], standalone: ['button'] });

            await formTester.invalid({
                code: "import { Button } from '@alfalab/core-components-button';",
                filename,
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('не сообщает об ошибке для агрегатор-импорта standalone-разделённого компонента без агрегатора', async () => {
            const filename = createProject({ standalone: ['button'] });

            await formTester.valid({
                code: "import { Button } from '@alfalab/core-components/button';",
                filename,
            });
        });

        it('не сообщает об ошибке для standalone-импорта, если установленный подпакет не разделён', async () => {
            // Разделён только агрегатор; подпакет установлен, но без desktop/mobile —
            // подсказка с платформенным путём у него была бы невыполнимой.
            const filename = createProject({
                aggregator: ['button'],
                standaloneUnsplit: ['button'],
            });

            await formTester.valid({
                code: "import { Button } from '@alfalab/core-components-button';",
                filename,
            });
        });

        it('не сообщает об ошибке для standalone-импорта, если подпакет вообще не установлен', async () => {
            // Разделён только агрегатор; standalone-пакета в node_modules нет.
            const filename = createProject({ aggregator: ['button'] });

            await formTester.valid({
                code: "import { Button } from '@alfalab/core-components-button';",
                filename,
            });
        });

        it('сообщает об ошибке для агрегатор-импорта, когда установлен только агрегатор', async () => {
            const filename = createProject({ aggregator: ['button'] });

            await formTester.invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                filename,
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
                options: [
                    { splitComponents: ['button', 'select'], excludeSplitComponents: ['button'] },
                ],
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
