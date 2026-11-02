import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';

import { bestPracticesConfig } from '../../eslint/rules/best-practices.js';

const ruleNames = [
    'de-morgan/no-negated-conjunction',
    'de-morgan/no-negated-disjunction',
    'unicorn/no-double-comparison',
    'unicorn/no-negated-array-predicate',
    'unicorn/no-negated-comparison',
    'unicorn/no-subtraction-comparison',
    'unicorn/no-useless-logical-operand',
    'unicorn/prefer-simplified-conditions',
];

const config: Linter.Config = {
    plugins: bestPracticesConfig.plugins,
    rules: Object.fromEntries(
        ruleNames.map((name) => [name, bestPracticesConfig.rules?.[name] ?? 'off']),
    ),
};

describe('совместимость Unicorn и De Morgan', () => {
    it('последовательно исправляет предикат массива и отрицание внутри него', () => {
        const linter = new Linter();
        const fixed = linter.verifyAndFix(
            'const items = [1, 2]; const result = !items.some(value => value > 0 && value < 10);',
            config,
        );

        expect(fixed.output).toContain('items.every(value => !(value > 0) || !(value < 10))');
        expect(fixed.messages).toEqual([]);
        expect(linter.verifyAndFix(fixed.output, config).fixed).toBe(false);
    });

    it('не дублирует сообщения об отрицании логической группы', () => {
        const code = 'if (!(first && !second)) work();';
        const linter = new Linter();

        expect(linter.verify(code, config).map(({ ruleId }) => ruleId)).toEqual([
            'de-morgan/no-negated-conjunction',
        ]);

        const overlappingConfig: Linter.Config = {
            ...config,
            rules: { ...config.rules, 'unicorn/prefer-simplified-conditions': 'error' },
        };

        expect(linter.verify(code, overlappingConfig).map(({ ruleId }) => ruleId)).toEqual([
            'de-morgan/no-negated-conjunction',
            'unicorn/prefer-simplified-conditions',
        ]);
    });

    it('сохраняет отрицания сравнений, чувствительных к NaN', () => {
        const linter = new Linter();
        const fixed = linter.verifyAndFix('if (!(min <= value && value <= max)) work();', config);

        expect(fixed.output).toBe('if (!(min <= value) || !(value <= max)) work();');
        expect(fixed.messages).toEqual([]);
        expect(linter.verifyAndFix(fixed.output, config).fixed).toBe(false);
    });
});
