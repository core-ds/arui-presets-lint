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
