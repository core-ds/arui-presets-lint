import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import config from '../stylelint/index.js';

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
