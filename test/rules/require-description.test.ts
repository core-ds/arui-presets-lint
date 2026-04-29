import { AST_TOKEN_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createRuleTester } from 'eslint-vitest-rule-tester';
import { describe, expect, it, vitest } from 'vitest';

import { requireDescriptionRule } from '../../eslint/plugins/disable-comments/rule/index.js';
import {
    createAboveCommentFix,
    createSuggestionFix,
    fixBlockComment,
} from '../../eslint/plugins/disable-comments/utils/index.js';

const testerConfig = {
    linterOptions: {
        reportUnusedDisableDirectives: false,
    },
    configs: {
        languageOptions: {
            parserOptions: {
                sourceType: 'module' as const,
                ecmaVersion: 2022 as const,
            },
        },
    },
};

const { valid, invalid } = createRuleTester({
    ...testerConfig,
    name: 'require-description',
    rule: requireDescriptionRule,
});

describe('require-description', () => {
    const getMockFixer = (): TSESLint.RuleFixer => {
        const replaceTextSpy = vitest.fn();
        const insertTextAfterSpy = vitest.fn();
        const insertTextAfterRangeSpy = vitest.fn();
        const insertTextBeforeSpy = vitest.fn();
        const insertTextBeforeRangeSpy = vitest.fn();
        const removeSpy = vitest.fn();
        const removeRangeSpy = vitest.fn();
        const replaceTextRangeSpy = vitest.fn();

        return {
            replaceText: (...args) => replaceTextSpy(...args),
            insertTextAfter: (...args) => insertTextAfterSpy(...args),
            insertTextAfterRange: (...args) => insertTextAfterRangeSpy(...args),
            insertTextBefore: (...args) => insertTextBeforeSpy(...args),
            insertTextBeforeRange: (...args) => insertTextBeforeRangeSpy(...args),
            remove: (...args) => removeSpy(...args),
            removeRange: (...args) => removeRangeSpy(...args),
            replaceTextRange: (...args) => replaceTextRangeSpy(...args),
        };
    };

    it('принимает строковый комментарий с описанием', async () => {
        await valid('// eslint-disable-next-line no-console -- временно отключено');
    });

    it('принимает блочный комментарий с описанием', async () => {
        await valid('/* eslint-disable no-debugger -- нужен для отладки */');
    });

    it('принимает строковый комментарий над директивой', async () => {
        await valid(`
            // причина отключения правила
            // eslint-disable-next-line no-alert
        `);
    });

    it('принимает блочный комментарий над директивой', async () => {
        await valid(`
            /* причина отключения правила */
            /* eslint-disable no-var */
        `);
    });

    it('принимает описание достаточной длины (> MIN_DESCRIPTION_LENGTH)', async () => {
        await valid('// eslint-disable-next-line eqeqeq -- проверка на строгие сравнения');
    });

    it('игнорирует директиву из списка options.ignore', async () => {
        await valid({
            code: '// eslint-disable-next-line no-console',
            options: [{ ignore: ['eslint-disable-next-line'] }],
        });
    });

    it('отсутствует описание для строкового комментария', async () => {
        const { result } = await invalid({
            code: '// eslint-disable-next-line no-console',
            errors: ['missingDescription'],
        });

        expect(result.fixed).toBeFalsy();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].messageId).toBe('missingDescription');

        expect(result.output).toBe('// eslint-disable-next-line no-console');
    });

    it('отсутствует описание для блочного комментария', async () => {
        const { result } = await invalid({
            code: '/* eslint-disable no-debugger */',
            errors: ['missingDescription'],
        });

        expect(result.fixed).toBeFalsy();

        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].messageId).toBe('missingDescription');

        expect(result.output).toBe('/* eslint-disable no-debugger */');
    });

    it('возвращает сообщение invalidDescription с корректным текстом', async () => {
        const { result } = await invalid({
            code: '// eslint-disable-next-line no-console -- ok',
            errors: ['invalidDescription'],
        });

        expect(result.messages[0].message).toContain(
            'Описание слишком общее или неинформативное. Укажите конкретную причину.',
        );
    });

    it('предлагает подсказку debug для missingDescription', async () => {
        const { result } = await invalid({
            code: '// eslint-disable-next-line no-console',
            errors: ['missingDescription'],
        });

        const suggestions = result.messages[0].suggestions ?? [];
        const debugSuggestion = suggestions[0];

        expect(debugSuggestion.desc).toContain(
            'Добавить комментарий - "Используется временно для отладки"',
        );
        expect(debugSuggestion.fix.text).toContain(
            '// eslint-disable-next-line no-console -- Используется временно для отладки',
        );
    });

    it('предлагает подсказку above-comment с корректным описанием', async () => {
        const { result } = await invalid({
            code: '// eslint-disable-next-line no-console',
            errors: ['missingDescription'],
        });

        const suggestions = result.messages[0].suggestions ?? [];
        const aboveSuggestion = suggestions[1];

        expect(aboveSuggestion.desc).toContain(
            'Добавить задачу (TODO) на исправление - "TODO: [ссылка на задачу] Описание"',
        );
        expect(aboveSuggestion.fix.text).toContain('// TODO: [ссылка на задачу] Описание');
    });

    it('возвращает null для многострочного блочного комментария', () => {
        const comment: TSESTree.Comment = {
            type: AST_TOKEN_TYPES.Block,
            value: `
                * eslint-disable no-console
                * eslint-enable no-debugger
            `.trim(),
            range: [0, 0],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 3, column: 2 },
            },
        };

        const mockFixer = getMockFixer();

        const result = fixBlockComment(mockFixer, comment, 'some description');

        expect(result).toBeNull();
    });

    it('возвращает null для неподдерживаемого типа комментария и не вызывает методы fixer', () => {
        const comment: TSESTree.NullToken = {
            type: AST_TOKEN_TYPES.Null, // указывает неподдерживаемый тип для проверки null
            value: `
                * eslint-disable no-console
                * eslint-enable no-debugger
            `.trim(),
            range: [0, 0],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 3, column: 2 },
            },
        };

        const mockFixer = getMockFixer();

        const suggestionFix = createSuggestionFix(
            comment as unknown as TSESTree.Comment,
            'some description',
        );
        const resultS = suggestionFix(mockFixer);

        expect(resultS).toBeNull();

        const aboveCommentFix = createAboveCommentFix(
            comment as unknown as TSESTree.Comment,
            'some description',
        );

        const resultA = aboveCommentFix(mockFixer);

        expect(resultA).toBeNull();
    });
});
