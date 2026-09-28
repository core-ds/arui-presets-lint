import { type TSESTree } from '@typescript-eslint/utils';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { isTypeOnlyExport } from '../../eslint/plugins/core-components/utils/is-type-only-export.js';

const parseExport = (code: string): TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration => {
    const { ast } = tseslint.parser.parseForESLint(code) as {
        ast: TSESTree.Program;
    };

    return ast.body[0] as TSESTree.ExportNamedDeclaration | TSESTree.ExportAllDeclaration;
};

describe('isTypeOnlyExport', () => {
    it('считает export type { X } from типовым', () => {
        expect(isTypeOnlyExport(parseExport("export type { ButtonProps } from 'x';"))).toBe(true);
    });

    it('считает export { type X } from типовым', () => {
        expect(isTypeOnlyExport(parseExport("export { type ButtonProps } from 'x';"))).toBe(true);
    });

    it('считает export с несколькими type-спецификаторами типовым', () => {
        expect(
            isTypeOnlyExport(parseExport("export { type B, type C } from 'x';")),
        ).toBe(true);
    });

    it('считает export type * from типовым', () => {
        expect(isTypeOnlyExport(parseExport("export type * from 'x';"))).toBe(true);
    });

    it('не считает export значения типовым', () => {
        expect(isTypeOnlyExport(parseExport("export { Button } from 'x';"))).toBe(false);
    });

    it('не считает export * from типовым', () => {
        expect(isTypeOnlyExport(parseExport("export * from 'x';"))).toBe(false);
    });

    it('не считает export * as ns from типовым', () => {
        expect(isTypeOnlyExport(parseExport("export * as ns from 'x';"))).toBe(false);
    });

    it('не считает смешанный экспорт значения и типа типовым', () => {
        expect(isTypeOnlyExport(parseExport("export { Button, type Props } from 'x';"))).toBe(false);
    });
});
