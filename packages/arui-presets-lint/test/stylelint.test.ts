import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

it('пресет требует свойства позиционирования перед остальными и исправляет порядок', async () => {
    const code = `.button {
    display: flex;
    position: relative;
    cursor: pointer;
    z-index: var(--layer);
}`;
    const checked = await stylelint.lint({ code, config });

    expect(checked.errored).toBe(true);
    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    );

    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(sorted.code).toBe(`.button {
    position: relative;
    z-index: var(--layer);
    display: flex;
    cursor: pointer;
}`);
    expect(sorted.results[0].warnings).toEqual([]);
});

it.each([
    {
        rule: 'alpha-value-notation',
        code: '.button { opacity: 50%; }',
        expected: '.button { opacity: 0.5; }',
    },
    {
        rule: 'alpha-value-notation',
        code: '.button { background-image: linear-gradient(rgb(0 0 0 / 50%), transparent); }',
        expected: '.button { background-image: linear-gradient(rgb(0 0 0 / 0.5), transparent); }',
    },
    {
        rule: 'value-keyword-case',
        code: '.button { display: BLOCK; }',
        expected: '.button { display: block; }',
    },
    {
        rule: 'font-weight-notation',
        code: '.button { font-weight: bold; }',
        expected: '.button { font-weight: 700; }',
    },
    {
        rule: 'font-weight-notation',
        code: '.button { font-weight: normal; }',
        expected: '.button { font-weight: 400; }',
    },
    {
        rule: 'font-weight-notation',
        code: '.button { font: italic normal 16px/1.5 BrandFont, sans-serif; }',
        expected: '.button { font: italic 400 16px/1.5 BrandFont, sans-serif; }',
    },
    {
        rule: 'function-url-quotes',
        code: '.button { background-image: url(./SomeImage.svg?Mode=Dark#Icon); }',
        expected: `.button { background-image: url('./SomeImage.svg?Mode=Dark#Icon'); }`,
    },
    {
        rule: 'import-notation',
        code: '@import url(./Base.css) layer(theme) supports(display: grid) screen and (min-width: 600px);',
        expected: `@import './Base.css' layer(theme) supports(display: grid) screen and (min-width: 600px);`,
    },
])(
    '$rule: исправляет запись и сохраняет совместимость с Prettier ($code)',
    async ({ rule, code, expected }) => {
        const source = await formatCss(code);
        const checked = await stylelint.lint({ code: source, config });

        expect(checked.errored).toBe(true);
        expect(checked.results[0].warnings).toContainEqual(
            expect.objectContaining({ rule, severity: 'error' }),
        );

        const corrected = await stylelint.lint({ code: source, config, fix: true });
        const formatted = await formatCss(corrected.code ?? '');

        expect(formatted).toBe(await formatCss(expected));
        expect(corrected.results[0].warnings).toEqual([]);
        expect((await stylelint.lint({ code: formatted, config })).results[0].warnings).toEqual([]);
    },
);

it('сохраняет регистр идентификаторов, SVG-значений и относительный вес шрифта', async () => {
    const code = await formatCss(`.button {
    --animation-name: SlideIn;
    --font-family: BrandFont;
    --keyword-payload: BLOCK;
    font-family: BrandFont, sans-serif;
    font-weight: lighter;
    color: currentColor;
    content: 'KeepCase';
    background-image: url('./SomeImage.svg?Mode=Dark#Icon');
    shape-rendering: geometricPrecision;
    animation-name: SlideIn;
}

.strong {
    font-weight: bolder;
}`);
    const checked = await stylelint.lint({ code, config });
    const corrected = await stylelint.lint({ code, config, fix: true });

    expect(checked.results[0].warnings).toEqual([]);
    expect(corrected.code).toBe(code);
    expect(corrected.results[0].warnings).toEqual([]);
});

it('разрешает lowerCamelCase в именах классов CSS Modules', async () => {
    const checked = await stylelint.lint({
        code: '.button, .buttonTitle, .buttonTitle2, .x { display: block; }',
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(checked.results[0].warnings).toEqual([]);
});

it.each(['ButtonTitle', 'button_title', 'button-title', 'button__title'])(
    'предупреждает о классе %s в CSS Modules и не переименовывает его автоматически',
    async (name) => {
        const code = `.${name} { display: block; }`;
        const options = { code, codeFilename: 'src/component.module.css', config };
        const checked = await stylelint.lint(options);
        const corrected = await stylelint.lint({ ...options, fix: true });

        expect(checked.results[0].warnings).toEqual([
            expect.objectContaining({
                rule: 'selector-class-pattern',
                severity: 'warning',
            }),
        ]);
        expect(checked.results[0].warnings[0].text).toContain('lowerCamelCase');
        expect(corrected.code).toBe(code);
        expect(corrected.results[0].warnings).toEqual(checked.results[0].warnings);
    },
);

it('проверяет явно заданные вложенные классы CSS Modules', async () => {
    const code = await formatCss(`.root {
    @media (width >= 600px) {
        .ButtonTitle {
            display: block;
        }
    }
}`);
    const checked = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
    });

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'selector-class-pattern', severity: 'warning' }),
    ]);
});

it('не ограничивает имена классов вне CSS Modules', async () => {
    const checked = await stylelint.lint({
        code: '.ButtonTitle, .button_title, .button-title { display: block; }',
        codeFilename: 'src/component.css',
        config,
    });

    expect(checked.results[0].warnings).toEqual([]);
});

it.each([
    'var(--color-light-bg-primary)',
    "url('./image.svg') center / cover no-repeat",
    'linear-gradient(var(--color-light-bg-primary), var(--color-light-text-primary))',
])('запрещает background: %s и не заменяет его автоматически', async (value) => {
    const code = await formatCss(`.button { background: ${value}; }`);
    const checked = await stylelint.lint({ code, config });
    const corrected = await stylelint.lint({ code, config, fix: true });

    expect(checked.errored).toBe(true);
    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'property-disallowed-list', severity: 'error' }),
    ]);
    expect(corrected.errored).toBe(true);
    expect(corrected.code).toBe(code);
    expect(corrected.results[0].warnings).toEqual(checked.results[0].warnings);
});

it('разрешает отдельные свойства фона, включая градиенты в background-image', async () => {
    const code = await formatCss(`.button {
    background-color: var(--color-light-bg-primary);
    background-image: linear-gradient(var(--color-light-bg-primary), var(--color-light-text-primary));
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: scroll;
    background-origin: padding-box;
    background-clip: border-box;
}`);
    const checked = await stylelint.lint({ code, config });

    expect(checked.results[0].warnings).toEqual([]);
});

it.each([
    { rule: 'property-no-unknown', code: '.button { widht: 10px; }' },
    { rule: 'declaration-property-value-no-unknown', code: '.button { display: fleex; }' },
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

it('проверяет неизвестные свойства в CSS Modules при разрешенном composes', async () => {
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

it('не разрешает composes за пределами CSS Modules', async () => {
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

it('сохраняет поддержку миксинов PostCSS, переменных и запасных CSS-деклараций', async () => {
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

it('требует согласованный порядок всех групп, начиная с composes в CSS Modules', async () => {
    const code = await formatCss(`.card {
    --z-value: 1;
    --a-value: 2;
    cursor: pointer;
    padding: var(--gap-16);
    background-color: var(--color-light-bg-primary);
    display: flex;
    color: var(--color-light-text-primary);
    transition: opacity 0.2s;
    width: 100%;
    top: 0;
    gap: var(--gap-8);
    position: relative;
    border-radius: var(--border-radius-8);
    align-items: center;
    font-weight: 700;
    opacity: 1;
    composes: base from './base.module.css';
}`);
    const options = { code, codeFilename: 'src/card.module.css', config };
    const checked = await stylelint.lint(options);

    expect(checked.errored).toBe(true);
    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    );

    const sorted = await stylelint.lint({ ...options, fix: true });

    expect(sorted.code).toBe(
        await formatCss(`.card {
    --z-value: 1;
    --a-value: 2;
    composes: base from './base.module.css';
    position: relative;
    top: 0;
    display: flex;
    gap: var(--gap-8);
    align-items: center;
    width: 100%;
    padding: var(--gap-16);
    font-weight: 700;
    color: var(--color-light-text-primary);
    background-color: var(--color-light-bg-primary);
    border-radius: var(--border-radius-8);
    opacity: 1;
    transition: opacity 0.2s;
    cursor: pointer;
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('задает порядок сокращенных, физических и логических форм отступов', async () => {
    const code = await formatCss(`.card {
    padding-inline: var(--inline-space);
    margin-inline: var(--inline-space);
    padding-left: var(--side-space);
    margin-block: var(--block-space);
    margin-top: var(--top-space);
    padding: var(--space);
    margin: var(--space);
}`);
    const checked = await stylelint.lint({ code, config });
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(checked.errored).toBe(true);
    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    );
    expect(sorted.code).toBe(
        await formatCss(`.card {
    margin: var(--space);
    margin-top: var(--top-space);
    margin-block: var(--block-space);
    margin-inline: var(--inline-space);
    padding: var(--space);
    padding-left: var(--side-space);
    padding-inline: var(--inline-space);
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('сохраняет последовательность fallback-деклараций внутри порядка свойств', async () => {
    const code = await formatCss(`.card {
    cursor: pointer;
    height: 100%;
    height: 100vh;
    display: var(--display);
    display: flex;
}`);
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(sorted.code).toBe(
        await formatCss(`.card {
    display: var(--display);
    display: flex;
    height: 100%;
    height: 100vh;
    cursor: pointer;
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('размещает префиксные свойства перед стандартной формой в той же группе', async () => {
    const code = await formatCss(`.card {
    cursor: pointer;
    transform: translateX(0);
    -webkit-transform: translateX(0);
    opacity: 1;
}`);
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(sorted.code).toBe(
        await formatCss(`.card {
    opacity: 1;
    -webkit-transform: translateX(0);
    transform: translateX(0);
    cursor: pointer;
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('требует свойства вне списка в конце по алфавиту', async () => {
    const code = await formatCss(`.card {
    math-style: normal;
    cursor: pointer;
    math-depth: 0;
    display: block;
}`);
    const checked = await stylelint.lint({ code, config });
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(checked.errored).toBe(true);
    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    );
    expect(sorted.code).toBe(
        await formatCss(`.card {
    display: block;
    cursor: pointer;
    math-depth: 0;
    math-style: normal;
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('проверяет порядок свойств внутри media queries и вложенных правил', async () => {
    const code = await formatCss(`.card {
    @media (width >= 600px) {
        color: var(--color-light-text-primary);
        width: 100%;
    }

    &:hover {
        cursor: pointer;
        opacity: 0.5;
    }
}`);
    const checked = await stylelint.lint({ code, config });
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    ]);
    expect(sorted.code).toBe(
        await formatCss(`.card {
    @media (width >= 600px) {
        width: 100%;
        color: var(--color-light-text-primary);
    }

    &:hover {
        opacity: 0.5;
        cursor: pointer;
    }
}`),
    );
    expect(sorted.results[0].warnings).toEqual([]);
});

it('предупреждает о CSS-переменных после обычных деклараций', async () => {
    const code = await formatCss(`.card {
    display: block;

    --level: 1;
}`);
    const checked = await stylelint.lint({ code, config });

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'order/order', severity: 'warning' }),
    ]);
});
