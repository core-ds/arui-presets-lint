import { type TSESTree } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';

import { getImportSourceString } from '../../eslint/plugins/core-components/utils/get-import-source-string.js';

const literal = (value: unknown): TSESTree.Node & { source: TSESTree.Expression } =>
    ({ source: { type: 'Literal', value } }) as unknown as TSESTree.Node & {
        source: TSESTree.Expression;
    };

describe('getImportSourceString', () => {
    it('возвращает строку для строкового литерала', () => {
        expect(getImportSourceString(literal('@alfalab/core-components/button'))).toBe(
            '@alfalab/core-components/button',
        );
    });

    it('возвращает null для нестрокового литерала', () => {
        expect(getImportSourceString(literal(42))).toBeNull();
    });

    it('возвращает null для не-Literal узла (шаблонная строка)', () => {
        const node = {
            source: { type: 'TemplateLiteral' },
        } as unknown as TSESTree.Node & { source: TSESTree.Expression };

        expect(getImportSourceString(node)).toBeNull();
    });
});
