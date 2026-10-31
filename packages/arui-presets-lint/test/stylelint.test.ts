import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

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

it('для импортированного @value требует точечное отключение проверки значений', async () => {
    const value = "@value size from './tokens.module.css';";
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
    /* stylelint-disable-next-line declaration-property-value-no-unknown -- значение из css modules @value */
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

it('stylelint пресет предупреждает о старых токенах и исправляет однозначные замены', async () => {
    const code = `.token { background: var(--color-light-bg-primary) var(--color-dark-indigo-10-flat); }`;
    const checked = await stylelint.lint({ code, config });

    expect(checked.results[0].warnings).toEqual([
        expect.objectContaining({
            rule: 'stylelint-core-vars/do-not-use-old-vars',
            severity: 'warning',
        }),
    ]);

    const corrected = await stylelint.lint({ code, config, fix: true });

    expect(corrected.code).toBe(
        code.replace('--color-dark-indigo-10-flat', '--color-light-bg-tertiary'),
    );

    expect(corrected.results[0].warnings).toEqual([]);
});
