import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

it.each([
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
    '$rule: исправляет запись и сохраняет совместимость с prettier ($code)',
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

it.each(['calc(50% + var(--extra-opacity))', 'clamp(0%, var(--extra-opacity), 100%)'])(
    'сохраняет проценты в выражении прозрачности %s при автоисправлении',
    async (value) => {
        const code = await formatCss(`.button {
    --extra-opacity: 20%;
    opacity: ${value};
}`);
        const checked = await stylelint.lint({ code, config });
        const corrected = await stylelint.lint({ code, config, fix: true });

        expect(checked.results[0].warnings).toEqual([]);

        expect(corrected.results[0].warnings).toEqual([]);

        expect(corrected.code).toBe(code);
    },
);

it('сохраняет @value при точечном отключении проверки значений', async () => {
    const code = await formatCss(`@value buttonWidth from './tokens.module.css';

.button {
    /* stylelint-disable-next-line declaration-property-value-no-unknown -- значение из css modules @value */
    width: buttonWidth;
}`);
    const options = { code, codeFilename: 'src/component.module.css', config };
    const checked = await stylelint.lint(options);
    const corrected = await stylelint.lint({ ...options, fix: true });

    expect(checked.results[0].warnings).toEqual([]);

    expect(corrected.results[0].warnings).toEqual([]);

    expect(corrected.code).toBe(code);
});
