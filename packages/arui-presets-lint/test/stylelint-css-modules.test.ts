import prettier from 'prettier';
import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import prettierConfig from '../prettier/index.js';
import config from '../stylelint/index.js';

const formatCss = (code: string) => prettier.format(code, { ...prettierConfig, parser: 'css' });

it.each([
    `.buttonTitle { display: block; }

.button { composes: buttonTitle; }`,
    `.button { composes: buttonTitle from './base.module.css'; }`,
    `.button { composes: externalButton from global; }`,
    `.grid { display: grid; grid-template-columns: [mainStart sideStart] 1fr [mainEnd]; }

.item { grid-column: mainStart / mainEnd; }`,
    `.card { container: cardPanel / inline-size; }

@container cardPanel (width > 500px) { .item { display: block; } }`,
    `.card { container-name: cardPanel; }

@container cardPanel (width > 500px) { .item { display: block; } }`,
    `.card { counter-set: CardCount 1; }

.item { content: counter(CardCount); }`,
    `.card { anchor-name: --cardAnchor; view-transition-name: cardImage; }`,
])('сохраняет регистр имен в CSS Modules: %s', async (input) => {
    const code = await formatCss(input);
    const options = { code, codeFilename: 'src/component.module.css', config };
    const checked = await stylelint.lint(options);
    const fixed = await stylelint.lint({ ...options, fix: true });

    expect(checked.results[0].warnings).toEqual([]);
    expect(fixed.code).toBe(code);
    expect(fixed.results[0].warnings).toEqual([]);
});

it('сохраняет имена Grid-линий и контейнеров в обычном CSS', async () => {
    const code = await formatCss(`.grid {
    display: grid;
    container-name: cardPanel;
    grid-template-columns: [mainStart] 1fr [mainEnd];
}

@container cardPanel (width > 500px) {
    .item { grid-column: mainStart / mainEnd; }
}`);
    const checked = await stylelint.lint({ code, codeFilename: 'src/component.css', config });
    const fixed = await stylelint.lint({ code, config, fix: true });

    expect(checked.results[0].warnings).toEqual([]);
    expect(fixed.code).toBe(code);
});

it.each([
    `@value size from './tokens.module.css';

.button { width: size; }`,
    `@value cardWidth: 240px;

.button { width: cardWidth; }`,
    `@value width as cardWidth, MODE from './tokens.module.css';

.button { display: MODE; width: calc(cardWidth - 1px); }`,
    `@value FLEX: flex;

.button { display: FLEX; }`,
    `@value width /* Исходное имя */ as cardWidth, mode as displayMode from './tokens.module.css';

.button { display: displayMode; width: cardWidth; }`,
])('принимает значения @value, сохраняя ссылки при автофиксе: %s', async (input) => {
    const code = await formatCss(input);
    const options = { code, codeFilename: 'src/component.module.css', config };
    const checked = await stylelint.lint(options);
    const fixed = await stylelint.lint({ ...options, fix: true });

    expect(checked.errored).toBe(false);
    expect(checked.results[0].warnings).toEqual([]);
    expect(fixed.code).toBe(code);
    expect(fixed.results[0].warnings).toEqual([]);
});

it.each(['display: fleex', 'width: missing', "width: 'size'", "width: url('size')"])(
    'обнаруживает ошибку %s при наличии @value',
    async (declaration) => {
        const code = await formatCss(`@value size from './tokens.module.css';

.button { ${declaration}; }`);
        const checked = await stylelint.lint({
            code,
            codeFilename: 'src/component.module.css',
            config,
        });

        expect(checked.errored).toBe(true);
        expect(checked.results[0].warnings).toContainEqual(
            expect.objectContaining({
                rule: 'arui-presets-lint/declaration-property-value-no-unknown',
                severity: 'error',
            }),
        );
    },
);

it('исправляет обычные ключевые слова, сохраняя имена из @value', async () => {
    const code = await formatCss(`@value cardWidth from './tokens.module.css';

.button { display: BLOCK; width: cardWidth; }`);
    const fixed = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
        fix: true,
    });

    expect(fixed.code).toBe(code.replace('BLOCK', 'block'));
    expect(fixed.results[0].warnings).toEqual([]);
});

it('сохраняет результат других автофиксов при исправлении регистра', async () => {
    const code = await formatCss(`@value cardWidth from './tokens.module.css';

.button {
    display: BLOCK;
    width: cardWidth;
    font-weight: BOLD;
}`);
    const fixed = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
        fix: true,
    });

    expect(fixed.code).toBe(code.replace('BLOCK', 'block').replace('BOLD', '700'));
    expect(fixed.results[0].warnings).toEqual([]);
});

it('исправляет ключевые слова внутри функций, сохраняя имена в var()', async () => {
    const code = await formatCss(`.button {
    background-image: linear-gradient(RED, var(--cardColor));
}`);
    const fixed = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config,
        fix: true,
    });

    expect(fixed.code).toBe(code.replace('RED', 'red'));
    expect(fixed.results[0].warnings).toEqual([]);
});

it.each(['@value missing;', "@value from './tokens.module.css';", '@value : 10px;'])(
    'не считает некорректное объявление %s значением @value',
    async (valueDeclaration) => {
        const code = await formatCss(`${valueDeclaration}\n\n.button { width: missing; }`);
        const checked = await stylelint.lint({
            code,
            codeFilename: 'src/component.module.css',
            config,
        });

        expect(checked.results[0].warnings).toContainEqual(
            expect.objectContaining({
                rule: 'arui-presets-lint/declaration-property-value-no-unknown',
            }),
        );
    },
);

it('позволяет включить проверку регистра без дополнительных параметров', async () => {
    const code = await formatCss('.button { display: BLOCK; }');
    const fixed = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config: {
            ...config,
            overrides: config.overrides.map((override) => ({
                ...override,
                rules: { ...override.rules, 'arui-presets-lint/value-keyword-case': 'lower' },
            })),
        },
        fix: true,
    });

    expect(fixed.code).toBe(code.replace('BLOCK', 'block'));
    expect(fixed.results[0].warnings).toEqual([]);
});

it.each([
    ['arui-presets-lint/value-keyword-case', 'display: BLOCK'],
    ['arui-presets-lint/declaration-property-value-no-unknown', 'display: fleex'],
])('учитывает отключение %s в CSS Modules', async (rule, declaration) => {
    const code = await formatCss(`.button {
    /* stylelint-disable-next-line ${rule} -- Проверка отключения */
    ${declaration};
}`);
    const options = { code, codeFilename: 'src/component.module.css', config };
    const checked = await stylelint.lint(options);
    const fixed = await stylelint.lint({ ...options, fix: true });

    expect(checked.results[0].warnings).toEqual([]);
    expect(fixed.results[0].warnings).toEqual([]);
    expect(fixed.code).toBe(code);
});

it('уважает disableFix и severity для проверки регистра в CSS Modules', async () => {
    const code = await formatCss('.button { display: BLOCK; }');
    const checked = await stylelint.lint({
        code,
        codeFilename: 'src/component.module.css',
        config: {
            ...config,
            overrides: config.overrides.map((override) => ({
                ...override,
                rules: {
                    ...override.rules,
                    'arui-presets-lint/value-keyword-case': [
                        'lower',
                        { disableFix: true, severity: 'warning' },
                    ],
                },
            })),
        },
        fix: true,
    });

    expect(checked.errored).toBe(false);
    expect(checked.code).toBe(code);
    expect(checked.results[0].warnings).toContainEqual(
        expect.objectContaining({
            rule: 'arui-presets-lint/value-keyword-case',
            severity: 'warning',
        }),
    );
});
