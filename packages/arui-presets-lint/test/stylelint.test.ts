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
    animation-name: SlideIn;
    font-family: BrandFont, sans-serif;
    background-image: url('./SomeImage.svg?Mode=Dark#Icon');
    font-weight: lighter;
    content: 'KeepCase';
    color: currentColor;
    shape-rendering: geometricPrecision;
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
