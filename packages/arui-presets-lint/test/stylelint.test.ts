import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

it('требует согласованный порядок всех групп, начиная с composes в CSS Modules', async () => {
    const code = await formatCss(`.block {
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
        await formatCss(`.block {
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
    const code = await formatCss(`.block {
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
        await formatCss(`.block {
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
    const code = await formatCss(`.block {
        cursor: pointer;
        height: 100%;
        height: 100vh;
        display: var(--display);
        display: flex;
    }`);
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(sorted.code).toBe(
        await formatCss(`.block {
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
    const code = await formatCss(`.block {
        cursor: pointer;
        transform: translateX(0);
        -webkit-transform: translateX(0);
        opacity: 1;
    }`);
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(sorted.code).toBe(
        await formatCss(`.block {
            opacity: 1;
            -webkit-transform: translateX(0);
            transform: translateX(0);
            cursor: pointer;
        }`),
    );

    expect(sorted.results[0].warnings).toEqual([]);
});

it('требует свойства вне списка в конце по алфавиту', async () => {
    const code = await formatCss(`.block {
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
        await formatCss(`.block {
            display: block;
            cursor: pointer;
            math-depth: 0;
            math-style: normal;
        }`),
    );

    expect(sorted.results[0].warnings).toEqual([]);
});

it('проверяет порядок свойств внутри media queries и вложенных правил', async () => {
    const code = await formatCss(`.block {
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
        await formatCss(`.block {
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
    const code = await formatCss(`.block {
        display: block;

        --level: 1;
    }`);
    const checked = await stylelint.lint({ code, config });

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({ rule: 'order/order', severity: 'warning' }),
    ]);
});

it('сохраняет поддержку background и порядок свойств фона', async () => {
    const code = await formatCss(`.block {
        cursor: pointer;
        background: var(--background);
        color: var(--color-light-text-primary);
        width: 100%;
        background-color: var(--color-light-bg-primary);
    }`);
    const checked = await stylelint.lint({ code, config });
    const sorted = await stylelint.lint({ code, config, fix: true });

    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({ rule: 'order/properties-order', severity: 'error' }),
    );

    expect(sorted.code).toBe(
        await formatCss(`.block {
            width: 100%;
            color: var(--color-light-text-primary);
            background: var(--background);
            background-color: var(--color-light-bg-primary);
            cursor: pointer;
        }`),
    );

    expect(sorted.results[0].warnings).toEqual([]);
});
