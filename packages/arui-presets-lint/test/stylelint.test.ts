import stylelint from 'stylelint';
import { expect, it } from 'vitest';

import config from '../stylelint/index.js';

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
