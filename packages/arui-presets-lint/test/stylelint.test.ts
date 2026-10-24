import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

it.each([
    { rule: 'property-no-unknown', code: '.button { widht: 10px; }' },
    { rule: 'declaration-property-value-no-unknown', code: '.button { display: fleex; }' },
    { rule: 'declaration-property-value-no-unknown', code: '.button { width: red; }' },
    {
        rule: 'declaration-block-no-duplicate-custom-properties',
        code: '.button { --level: 1; --level: 2; }',
    },
    { rule: 'declaration-no-important', code: '.button { display: block !important; }' },
    {
        rule: 'declaration-no-important',
        code: '@keyframes fade { from { opacity: 0 !important; } }',
    },
])('$rule: сообщает об ошибке в $code', async ({ rule, code }) => {
    const checked = await stylelint.lint({ code: await formatCss(code), config });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule, severity: 'error' }),
    );
});

it.each(['shared', "shared from './base.module.css'"])(
    'разрешает composes: %s в CSS Modules',
    async (value) => {
        const checked = await stylelint.lint({
            code: `.button { composes: ${value}; }`,
            codeFilename: 'src/component.module.css',
            config,
        });

        expect(checked.results[0].warnings).toEqual([]);
    },
);

it('проверяет неизвестные свойства в css modules при разрешенном composes', async () => {
    const checked = await stylelint.lint({
        code: '.button { composes: shared; widht: 10px; }',
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'property-no-unknown', severity: 'error' }),
    ]);

    expect(checked.results[0].warnings[0].text).toContain('widht');
});

it('не разрешает composes за пределами css modules', async () => {
    const checked = await stylelint.lint({
        code: '.button { composes: shared; }',
        codeFilename: 'src/component.css',
        config,
    });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'property-no-unknown', severity: 'error' }),
    ]);
});

it.each([
    '@value size: 24px;',
    "@value size from './tokens.module.css';",
    "@value importedSize as size from './tokens.module.css';",
])('для %s требует точечное отключение проверки значений', async (value) => {
    const code = await formatCss(`${value}

.button {
    width: size;
}`);
    const checked = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({
            rule: 'declaration-property-value-no-unknown',
            severity: 'error',
        }),
    ]);

    const explainedCode = await formatCss(`${value}

.button {
    /* stylelint-disable-next-line declaration-property-value-no-unknown -- значение из сss modules @value */
    width: size;
}`);
    const explained = await stylelint.lint({
        code: explainedCode,
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(explained.errored).toBe(false);

    expect(explained.results[0].warnings).toEqual([]);
});

it('отключение для @value не скрывает опечатки в значениях css modules', async () => {
    const code = await formatCss(`@value size from './tokens.module.css';

.button {
    /* stylelint-disable-next-line declaration-property-value-no-unknown -- значение из css modules @value */
    width: size;
    display: fleex;
}`);
    const checked = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({
            rule: 'declaration-property-value-no-unknown',
            severity: 'error',
        }),
    ]);

    expect(checked.results[0].warnings[0].text).toContain('fleex');
});

it('сохраняет поддержку миксинов PostCSS, переменных и запасных css деклараций', async () => {
    const code = await formatCss(`@define-mixin expanded {
        display: block;
        width: var(--button-width, 100%);
    }

    .button {
        --level: 1;
        height: 100%;
        height: 100vh;
        @mixin expanded;
    }

    .active {
        --level: 2;
        opacity: 0.5;
    }`);

    const checked = await stylelint.lint({ code, config });

    expect(checked.results[0].warnings).toEqual([]);
});

it('сохраняет регистр имен Grid и контейнеров при автоисправлении', async () => {
    const code = await formatCss(`.grid {
        display: grid;
        grid-template-columns: [mainStart] 1fr [mainEnd];
        container-name: cardPanel;
    }

    .item {
        grid-column: mainStart / mainEnd;
    }

    @container cardPanel (width > 400px) {
        .item {
            display: block;
        }
    }`);
    const checked = await stylelint.lint({ code, config });
    const corrected = await stylelint.lint({ code, config, fix: true });

    expect(checked.results[0].warnings).toEqual([]);

    expect(corrected.results[0].warnings).toEqual([]);

    expect(corrected.code).toBe(code);
});

it.each([
    {
        name: 'отключение без объяснения',
        code: `.button {
            /* stylelint-disable-next-line declaration-no-important */
            display: block !important;
        }`,
        rule: '--report-descriptionless-disables',
    },
    {
        name: 'ненужное отключение с объяснением',
        code: `.button {
                /* stylelint-disable-next-line declaration-no-important -- Сторонний компонент */
                display: block;
            }`,
        rule: '--report-needless-disables',
    },
])('считает ошибкой $name', async ({ code, rule }) => {
    const checked = await stylelint.lint({ code: await formatCss(code), config });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule, severity: 'error' }),
    ]);
});

it('разрешает необходимое точечное отключение с объяснением', async () => {
    const code = await formatCss(`.button {
        /* stylelint-disable-next-line declaration-no-important -- Сторонний компонент */
        display: block !important;
    }`);
    const checked = await stylelint.lint({ code, config });

    expect(checked.errored).toBe(false);

    expect(checked.results[0].warnings).toEqual([]);
});

it('точечное отключение не скрывает ошибки других правил', async () => {
    const code = await formatCss(`.button {
        /* stylelint-disable-next-line declaration-no-important -- Сторонний компонент */
        display: block !important;
        widht: 10px;
    }`);
    const checked = await stylelint.lint({ code, config });

    expect(checked.errored).toBe(true);

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'property-no-unknown', severity: 'error' }),
    ]);
});
