import { type TSESTree } from '@typescript-eslint/utils';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { isTypeOnlyImport } from '../../eslint/plugins/core-components/utils/is-type-only-import.js';

const parseImport = (code: string): TSESTree.ImportDeclaration => {
    const { ast } = tseslint.parser.parseForESLint(code) as {
        ast: TSESTree.Program;
    };

    return ast.body[0] as TSESTree.ImportDeclaration;
};

describe('isTypeOnlyImport', () => {
    it('считает import type типовым', () => {
        expect(isTypeOnlyImport(parseImport("import type { ButtonProps } from 'x';"))).toBe(true);
    });

    it('считает импорт только из type-спецификаторов типовым', () => {
        expect(
            isTypeOnlyImport(parseImport("import { type ButtonProps, type Data } from 'x';")),
        ).toBe(true);
    });

    it('не считает импорт значения типовым', () => {
        expect(isTypeOnlyImport(parseImport("import { Button } from 'x';"))).toBe(false);
    });

    it('не считает смешанный импорт значения и типа типовым', () => {
        expect(isTypeOnlyImport(parseImport("import { Button, type Props } from 'x';"))).toBe(false);
    });

    it('не считает импорт без спецификаторов (side-effect) типовым', () => {
        expect(isTypeOnlyImport(parseImport("import 'x';"))).toBe(false);
    });

    it('не считает импорт default-спецификатора типовым', () => {
        expect(isTypeOnlyImport(parseImport("import Button from 'x';"))).toBe(false);
    });
});
