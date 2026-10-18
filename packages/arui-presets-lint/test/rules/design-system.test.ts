import { createRuleTester } from 'eslint-vitest-rule-tester';
import { describe, it } from 'vitest';

import { designSystemPlugin } from '../../eslint/plugins/design-system/index.js';

const testerConfig = {
    configs: {
        languageOptions: {
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
    },
};

describe('no-deprecated-api', () => {
    const { valid, invalid } = createRuleTester({
        ...testerConfig,
        name: 'no-deprecated-api',
        rule: designSystemPlugin.rules!['no-deprecated-api'],
    });

    it('проверяет алиасы named imports и показывает замену', async () => {
        await invalid({
            code: "import { Old as Alias } from 'ds';",
            options: [[{ module: 'ds', export: 'Old', replacement: 'New' }]],
            errors: [
                {
                    messageId: 'deprecated',
                    message: 'API Old из ds устарел. Используйте New.',
                },
            ],
        });
    });

    it('проверяет namespace imports и игнорирует совпадение имени другой библиотеки', async () => {
        await invalid({
            code: `import * as DS from 'ds';
                import * as Other from 'other';
                export const view = <><DS.Old /><Other.Old /></>;`,
            options: [[{ module: 'ds', export: 'Old' }]],
            errors: ['deprecated'],
        });
    });

    it('проверяет статическое обращение к namespace и реэкспорт', async () => {
        await invalid({
            code: `import * as DS from 'ds';
                DS['Old']();
                export { Old as Alias } from 'ds';`,
            options: [[{ module: 'ds', export: 'Old' }]],
            errors: ['deprecated', 'deprecated'],
        });
    });

    it('пропускает API при отсутствующем или пустом реестре', async () => {
        const code = `import { Old } from 'ds';
            import * as DS from 'ds';
            export { Old as Alias } from 'ds';
            DS.Old();
            export const view = <DS.Old />;`;

        await valid({ code });
        await valid({ code, options: [[]] });
    });
});

describe('no-deprecated-props', () => {
    const { valid, invalid } = createRuleTester({
        ...testerConfig,
        name: 'no-deprecated-props',
        rule: designSystemPlugin.rules!['no-deprecated-props'],
    });

    it('проверяет deprecated props у импортированного алиаса', async () => {
        await invalid({
            code: `import { Button as Alias } from 'ds';
                import { Button as Other } from 'other';
                export const view = <><Alias old /><Other old /><Unrelated old /></>;`,
            options: [[{ module: 'ds', component: 'Button', prop: 'old' }]],
            errors: ['deprecatedProp'],
        });
    });

    it('не считает локальный компонент с тем же именем импортом DS', async () => {
        await valid({
            code: `import { Button } from 'ds';
                export function Demo(Button) {
                    return <Button old />;
                }`,
            options: [[{ module: 'ds', component: 'Button', prop: 'old' }]],
        });
    });

    it('пропускает props при отсутствующем или пустом реестре', async () => {
        const code = "import { Button } from 'ds'; export const view = <Button old />;";

        await valid({ code });
        await valid({ code, options: [[]] });
    });
});

describe('require-accessible-name', () => {
    const { valid, invalid } = createRuleTester({
        ...testerConfig,
        name: 'require-accessible-name',
        rule: designSystemPlugin.rules!['require-accessible-name'],
    });

    it('проверяет отсутствие, пустоту и наличие доступного имени', async () => {
        await invalid({
            code: `import { IconButton as Icon } from 'ds';
                export const view = <>
                    <Icon />
                    <Icon aria-label=" " />
                    <Icon aria-label="Закрыть" />
                    <Icon aria-label={label} />
                </>;`,
            options: [[{ module: 'ds', component: 'IconButton' }]],
            errors: [
                { messageId: 'missingLabel', line: 3 },
                { messageId: 'missingLabel', line: 4 },
            ],
        });
    });

    it('не считает spread доступным именем по умолчанию', async () => {
        await invalid({
            code: "import { Icon } from 'ds'; export const view = <Icon {...props} />;",
            options: [[{ module: 'ds', component: 'Icon' }]],
            errors: ['missingLabel'],
        });
    });

    it('разрешает spread при явной настройке allowSpread', async () => {
        await valid({
            code: "import { Icon } from 'ds'; export const view = <Icon {...props} />;",
            options: [[{ module: 'ds', component: 'Icon', allowSpread: true }]],
        });
    });

    it('пропускает доступные имена при отсутствующем или пустом реестре', async () => {
        const code = "import { Icon } from 'ds'; export const view = <Icon />;";

        await valid({ code });
        await valid({ code, options: [[]] });
    });
});
