import { TSESLint } from '@typescript-eslint/utils';
import { createRuleTester } from 'eslint-vitest-rule-tester';
import assert from 'node:assert/strict';
import path from 'node:path';
import ts from 'typescript';
import tseslint from 'typescript-eslint';
import { describe, expect, it } from 'vitest';

import { getComponentDeprecation } from '../../eslint/plugins/design-system/deprecation.js';
import { annotatedComponentsRule } from '../../eslint/plugins/design-system/rules/no-deprecated-components.js';
import { component } from '../../eslint/plugins/design-system/utils.js';

const filename = path.resolve('design-system-unit.tsx');
const { parser } = tseslint;

function resolveComponents(code: string) {
    const components: Array<ReturnType<typeof component>> = [];
    const collectComponents: TSESLint.RuleModule<never> = {
        meta: { type: 'problem', messages: {}, schema: [] },
        create(context) {
            return {
                JSXOpeningElement(node) {
                    components.push(component(context.sourceCode, node));
                },
            };
        },
    };
    const linter = new TSESLint.Linter();
    const messages = linter.verify(
        code,
        [
            {
                files: ['**/*.tsx'],
                languageOptions: { parser },
                plugins: { test: { rules: { 'collect-components': collectComponents } } },
                rules: { 'test/collect-components': 'error' },
            },
        ],
        { filename },
    );

    expect(messages).toEqual([]);

    return components;
}

function createProgram(code: string, declarations = '') {
    const sources = new Map([
        [filename, code],
        [path.resolve('design-system-unit.d.ts'), declarations],
    ]);
    const options: ts.CompilerOptions = {
        jsx: ts.JsxEmit.Preserve,
        module: ts.ModuleKind.ESNext,
        noLib: true,
        types: [],
    };
    const host = ts.createCompilerHost(options);

    host.getSourceFile = (file, languageVersion) => {
        const source = sources.get(file);

        if (source !== undefined) {
            return ts.createSourceFile(file, source, languageVersion, true);
        }
    };

    return ts.createProgram([...sources.keys()], options, host);
}

function getDeprecations(code: string, declarations?: string) {
    const program = createProgram(code, declarations);
    const source = program.getSourceFile(filename);
    const checker = program.getTypeChecker();
    const descriptions: Array<string | undefined> = [];

    assert(source);

    function visit(node: ts.Node) {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
            descriptions.push(getComponentDeprecation(checker, node));
        }

        ts.forEachChild(node, visit);
    }

    visit(source);

    return descriptions;
}

describe('component', () => {
    it('возвращает исходное имя и модуль для разных форм импорта', () => {
        expect(
            resolveComponents(`
                import Default from 'default-ui';
                import { Group as Alias, 'icon-button' as Icon } from 'named-ui';
                import * as UI from 'namespace-ui';
                <><Default /><Alias.Item /><Icon /><UI.Group.Item /></>;
            `),
        ).toEqual([
            { module: 'default-ui', export: 'default' },
            { module: 'named-ui', export: 'Group.Item' },
            { module: 'named-ui', export: 'icon-button' },
            { module: 'namespace-ui', export: 'Group.Item' },
        ]);
    });

    it('игнорирует встроенные теги, импорты типов и локальные значения', () => {
        expect(
            resolveComponents(`
                import { Button, Div as div } from 'ui';
                import type { TypeOnly, Local } from 'ui';
                import { type InlineType } from 'ui';
                const Local = () => null;
                function Example(Button: () => null) {
                    return <><Button /><div /><TypeOnly /><InlineType /><Local /><custom-element /></>;
                }
            `),
        ).toEqual([undefined, undefined, undefined, undefined, undefined, undefined]);
    });

    it('находит импорт значения за одноименным типом во вложенной области', () => {
        expect(
            resolveComponents(`
                import { Button } from 'ui';
                function Example() {
                    type Button = string;
                    return <Button />;
                }
            `),
        ).toEqual([{ module: 'ui', export: 'Button' }]);
    });
});

describe('getComponentDeprecation', () => {
    it('различает тег без описания и отсутствие тега', () => {
        expect(
            getDeprecations(`
                /** @deprecated */
                const Old = () => null;
                const Current = () => null;
                <><Old /><Current /><Unknown /></>;
            `),
        ).toEqual(['', undefined, undefined]);
    });

    it('читает аннотацию только у выбранной перегрузки', () => {
        expect(
            getDeprecations(`
                /** @deprecated Используйте mode="current" */
                declare function Control(props: { mode: 'legacy' }): null;
                declare function Control(props: { mode: 'current' }): null;
                <><Control mode="current" /><Control mode="legacy" /></>;
            `),
        ).toEqual([undefined, 'Используйте mode="current"']);
    });

    it('читает аннотацию перед промежуточным реэкспортом', () => {
        expect(
            getDeprecations(
                "import * as UI from 'ui'; <UI.Old />;",
                `
                    declare module 'original-ui' {
                        export const Button: () => null;
                    }
                    declare module 'legacy-ui' {
                        /** @deprecated Используйте Button */
                        export { Button as Old } from 'original-ui';
                    }
                    declare module 'ui' {
                        export { Old } from 'legacy-ui';
                    }
                `,
            ),
        ).toEqual(['Используйте Button']);
    });
});

describe('annotatedComponentsRule', () => {
    const { invalid, valid } = createRuleTester({
        name: 'no-deprecated-components',
        rule: annotatedComponentsRule,
        configs: { languageOptions: { parser } },
    });
    const options = [{ modules: ['arui-private'] }];

    it('указывает имя JSX-компонента даже для тега без описания', async () => {
        const code = `import { Old as Alias, Current } from 'arui-private';
<><Alias /><Current /></>;`;
        const program = createProgram(
            code,
            `declare module 'arui-private' {
                /** @deprecated */
                export const Old: () => null;
                export const Current: () => null;
            }`,
        );

        await invalid({
            code,
            filename,
            options,
            languageOptions: { parserOptions: { programs: [program] } },
            errors: [{ messageId: 'deprecatedComponent', line: 2, column: 4, endColumn: 9 }],
        });
    });

    it('пропускает подходящий компонент без типовой информации', async () => {
        await valid({
            code: "import { Old } from 'arui-private/button'; <Old />;",
            filename,
            options,
        });
    });

    it('пропускает устаревшие компоненты из пакетов вне списка', async () => {
        const code = "import { Old } from 'arui-private-other'; <Old />;";
        const program = createProgram(
            code,
            `declare module 'arui-private-other' {
                /** @deprecated */
                export const Old: () => null;
            }`,
        );

        await valid({
            code,
            filename,
            options,
            languageOptions: { parserOptions: { programs: [program] } },
        });
    });
});
