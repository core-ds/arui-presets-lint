import stylelint from 'stylelint';
import { describe, expect, it } from 'vitest';

import plugins, { RULE_DO_NOT_USE_OLD_VARS } from '../lib/index.js';

const lint = (code: string, fix = false) =>
    stylelint.lint({
        code,
        fix,
        config: {
            plugins,
            rules: { [RULE_DO_NOT_USE_OLD_VARS]: true },
        },
    });

describe('устаревшие CSS-токены', () => {
    const code = `.class {
    background:
        var(--color-light-bg-primary)
        var(--color-dark-indigo-10-flat);
}`;

    it('находит старый токен после актуального в многострочном значении', async () => {
        const { results } = await lint(code);

        expect(results[0].warnings).toEqual([
            expect.objectContaining({
                rule: RULE_DO_NOT_USE_OLD_VARS,
                line: 4,
                column: 13,
                endLine: 4,
                endColumn: 40,
            }),
        ]);
    });

    it('заменяет старый токен, сохраняя актуальный токен и форматирование', async () => {
        const { code: fixed, results } = await lint(code, true);

        expect(fixed).toBe(
            code.replace('--color-dark-indigo-10-flat', '--color-light-bg-tertiary'),
        );
        expect(results[0].warnings).toEqual([]);
    });

    it.each([
        {
            name: 'несколько старых токенов после актуального',
            value: 'var(--color-light-bg-primary) var(--color-dark-indigo-10-flat) var(--color-dark-indigo-07-flat)',
            fixed: 'var(--color-light-bg-primary) var(--color-light-bg-tertiary) var(--color-light-specialbg-component)',
            warnings: 2,
        },
        {
            name: 'повторяющийся старый токен',
            value: 'var(--color-dark-indigo-10-flat) var(--color-dark-indigo-10-flat)',
            fixed: 'var(--color-light-bg-tertiary) var(--color-light-bg-tertiary)',
            warnings: 2,
        },
        {
            name: 'вложенные fallback-значения',
            value: 'var(--color-light-bg-primary, var(--color-dark-indigo-10-flat, var(--color-dark-indigo-07-flat)))',
            fixed: 'var(--color-light-bg-primary, var(--color-light-bg-tertiary, var(--color-light-specialbg-component)))',
            warnings: 2,
        },
        {
            name: 'токены внутри другой CSS-функции',
            value: 'linear-gradient(var(--color-light-bg-primary), var(--color-dark-indigo-10-flat))',
            fixed: 'linear-gradient(var(--color-light-bg-primary), var(--color-light-bg-tertiary))',
            warnings: 1,
        },
        {
            name: 'пробелы и комментарии в var()',
            value: 'var( /* комментарий */ --color-dark-indigo-10-flat , #fff)',
            fixed: 'var( /* комментарий */ --color-light-bg-tertiary , #fff)',
            warnings: 1,
        },
        {
            name: 'такое же имя токена в строке перед var()',
            value: 'url("--color-dark-indigo-10-flat") var(--color-dark-indigo-10-flat)',
            fixed: 'url("--color-dark-indigo-10-flat") var(--color-light-bg-tertiary)',
            warnings: 1,
        },
        {
            name: 'комментарий между функциями var()',
            value: 'var(--color-light-bg-primary) /* var(--color-dark-indigo-10-flat) */ var(--color-dark-indigo-07-flat)',
            fixed: 'var(--color-light-bg-primary) /* var(--color-dark-indigo-10-flat) */ var(--color-light-specialbg-component)',
            warnings: 1,
        },
    ])('проверяет все вхождения: $name', async ({ value, fixed, warnings }) => {
        const source = `.class { background: ${value}; }`;
        const fixedSource = `.class { background: ${fixed}; }`;
        const checked = await lint(source);
        const corrected = await lint(source, true);

        expect(checked.results[0].warnings).toHaveLength(warnings);
        expect(corrected.code).toBe(fixedSource);
        expect(corrected.results[0].warnings).toEqual([]);

        const repeated = await lint(fixedSource, true);

        expect(repeated.code).toBe(corrected.code);
        expect(repeated.results[0].warnings).toEqual([]);
    });

    it.each([
        ['--color-dark-indigo', 'var(--color-dark-indigo) var(--color-dark-indigo-10-flat)'],
        ['--color-red-brand-85', 'var(--color-red-brand-85) var(--color-dark-indigo-10-flat)'],
        ['--color-dark-indigo', 'var(--color-dark-indigo-10-flat) var(--color-dark-indigo)'],
        ['--color-red-brand-85', 'var(--color-dark-indigo-10-flat) var(--color-red-brand-85)'],
        ['--color-dark-indigo', 'var(--color-dark-indigo, var(--color-dark-indigo-10-flat))'],
    ])(
        'оставляет неоднозначный или незаменяемый токен %s при исправлении %s',
        async (token, value) => {
            const source = `.class { background: ${value}; }`;
            const checked = await lint(source);
            const corrected = await lint(source, true);

            expect(checked.results[0].warnings).toHaveLength(2);
            expect(corrected.code).toBe(
                source.replace('--color-dark-indigo-10-flat', '--color-light-bg-tertiary'),
            );
            const index = Math.max(
                source.indexOf(`var(${token})`),
                source.indexOf(`var(${token},`),
            );

            expect(corrected.results[0].warnings).toEqual([
                expect.objectContaining({
                    rule: RULE_DO_NOT_USE_OLD_VARS,
                    column: index + 5,
                }),
            ]);
            expect(corrected.results[0].warnings[0].text).toContain(token);
        },
    );

    it('указывает позицию токена после комментария в исходном значении', async () => {
        const source = `.class { background: var(--color-light-bg-primary) /* var(--color-dark-indigo-10-flat) */ var(--color-dark-indigo-10-flat); }`;
        const { results } = await lint(source);
        const token = '--color-dark-indigo-10-flat';

        expect(results[0].warnings).toEqual([
            expect.objectContaining({
                column: source.lastIndexOf(token) + 1,
                endColumn: source.lastIndexOf(token) + token.length + 1,
            }),
        ]);
    });

    it.each([
        '"var(--color-dark-indigo-10-flat)"',
        'url("var(--color-dark-indigo-10-flat)")',
        'var(--custom-color, #fff)',
    ])('не принимает строки и неизвестные токены за устаревшие: %s', async (value) => {
        const source = `.class { content: ${value}; }`;
        const { code: fixed, results } = await lint(source, true);

        expect(fixed).toBe(source);
        expect(results[0].warnings).toEqual([]);
    });
});
