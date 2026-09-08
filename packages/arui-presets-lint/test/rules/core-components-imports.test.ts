import tsParser from '@typescript-eslint/parser';
import { createRuleTester } from 'eslint-vitest-rule-tester';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { CORE_COMPONENTS_PACKAGE } from '../../eslint/plugins/core-components/constants.js';
import { coreComponentsImportRule } from '../../eslint/plugins/core-components/rule/index.js';
import { type CoreComponentsImportFinding } from '../../eslint/plugins/core-components/types.js';

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
    });

    describe('invalid', () => {
        it('флагает импорт сплитнутого компонента без платформенного сабпаса', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('флагает export from сплитнутого компонента', async () => {
            await invalid({
                code: "export { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('флагает export * from сплитнутого компонента', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('флагает импорт сплитнутого компонента с /index', async () => {
            await invalid({
                code: "export * from '@alfalab/core-components/button/index';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('флагает смешанный импорт значения и типа с корня', async () => {
            await invalid({
                code: "import { Button, type ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('принимает import type из сплит-компонента', async () => {
            await valid({
                code: "import type { ButtonProps } from '@alfalab/core-components/button';",
                options: [{ splitComponents }],
            });
        });

        it.each([...splitComponents])('флагает импорт %s с корня', async (component) => {
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
        it('флагает сплит-компонент, определённый из node_modules', async () => {
            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ reportFile: false }],
                errors: [{ messageId: 'missingPlatform' }],
            });
        });

        it('принимает платформенный импорт при runtime-скане', async () => {
            await valid({
                code: "import { ButtonDesktop } from '@alfalab/core-components/button/desktop';",
                options: [{ reportFile: false }],
            });
        });
    });

    describe('отчёт в JSON', () => {
        let tmpDir: string;

        beforeEach(() => {
            tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-components-imports-'));
        });

        afterEach(() => {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        });

        it('пишет плоский список нарушений с нормализованным путём', async () => {
            const reportFile = path.join(tmpDir, 'errors.json');

            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents, reportFile }],
                errors: [{ messageId: 'missingPlatform' }],
            });

            const report = JSON.parse(fs.readFileSync(reportFile, 'utf8')) as CoreComponentsImportFinding[];

            expect(report).toHaveLength(1);
            expect(report[0]).toMatchObject({
                component: 'button',
                line: 1,
                importPath: '@alfalab/core-components/button',
            });
            // Путь в отчёте всегда с разделителем "/", независимо от ОС
            expect(report[0].file).not.toContain('\\');
        });

        it('не пишет отчёт при reportFile: false', async () => {
            const reportFile = path.join(tmpDir, 'should-not-exist.json');

            await invalid({
                code: "import { Button } from '@alfalab/core-components/button';",
                options: [{ splitComponents, reportFile: false }],
                errors: [{ messageId: 'missingPlatform' }],
            });

            expect(fs.existsSync(reportFile)).toBe(false);
        });
    });
});
