import { ESLint } from 'eslint';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import ts from 'typescript';
import tseslint from 'typescript-eslint';
import { describe, it } from 'vitest';

import {
    createDesignSystemConfig,
    type DesignSystemOptions,
} from '../../eslint/plugins/design-system/index.js';

const componentOptions: DesignSystemOptions = {
    deprecatedComponents: { modules: ['@alfalab/core-components', 'arui-private'] },
};

async function lint(
    code: string,
    options: DesignSystemOptions = componentOptions,
    declarationSource?: string,
) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-ds-integration-'));

    try {
        const file = path.join(cwd, 'example.tsx');
        const declarations = path.join(cwd, 'ds.d.ts');

        await writeFile(file, code);
        await writeFile(
            declarations,
            declarationSource ??
                `declare module 'arui-private' {
            /** @deprecated Используйте Modern */
            export function Legacy(): null;
            export function Modern(): null;
            /** @deprecated Используйте Modern */
            export default function LegacyDefault(): null;
        }`,
        );

        const program = ts.createProgram([file, declarations], {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
        });

        const eslint = new ESLint({
            cwd,
            overrideConfigFile: true,
            overrideConfig: [
                {
                    files: ['**/*.tsx'],
                    languageOptions: {
                        parser: tseslint.parser,
                        parserOptions: { programs: [program], tsconfigRootDir: cwd },
                    },
                },
                ...createDesignSystemConfig(options),
            ],
        });

        const [result] = await eslint.lintText(code, { filePath: file });

        return result.messages;
    } finally {
        await rm(cwd, { recursive: true, force: true });
    }
}

describe('проверка устаревших компонентов дизайн-системы', () => {
    it('предупреждает об @deprecated у алиаса и namespace import', async () => {
        const messages = await lint(`
            import { Legacy as Old } from 'arui-private';
            import * as Private from 'arui-private';
            export const view = <><Old /><Private.Legacy /></>;
        `);

        assert.equal(messages.length, 2);
        assert.equal(
            messages.every(
                (message) =>
                    message.ruleId === 'design-system/no-deprecated-components' &&
                    message.severity === 1,
            ),
            true,
        );
        assert.equal(
            messages.every((message) => message.message.includes('Используйте Modern')),
            true,
        );
    });

    it('проверяет только выбранные библиотеки и их subpath imports', async () => {
        const code = `import { Legacy as Core } from '@alfalab/core-components/button';
            import { Legacy as Private } from 'arui-private/legacy';
            import { Legacy as Other } from 'arui-private-other';
            import { Legacy as Standalone } from '@alfalab/core-components-button';
            export const view = <>
                <Core />
                <Private />
                <Other />
                <Standalone />
            </>;`;
        const declarations = [
            '@alfalab/core-components/button',
            '@alfalab/core-components-button',
            'arui-private/legacy',
            'arui-private-other',
        ]
            .map(
                (moduleName) => `declare module '${moduleName}' {
                    /** @deprecated Используйте Modern */
                    export function Legacy(): null;
                }`,
            )
            .join('\n');
        const messages = await lint(code, componentOptions, declarations);

        assert.deepEqual(
            messages.map((message) => ({ messageId: message.messageId, line: message.line })),
            [
                { messageId: 'deprecatedComponent', line: 6 },
                { messageId: 'deprecatedComponent', line: 7 },
                { messageId: 'deprecatedComponent', line: 9 },
            ],
        );

        const customModules = await lint(
            code,
            { deprecatedComponents: { modules: ['arui-private-other'] } },
            declarations,
        );

        assert.deepEqual(
            customModules.map((message) => ({ messageId: message.messageId, line: message.line })),
            [{ messageId: 'deprecatedComponent', line: 8 }],
        );
    });

    it('пропускает современный компонент и локальный shadowing', async () => {
        const messages = await lint(`
            import { Legacy as Old, Modern } from 'arui-private';
            export function Demo() {
                const Old = () => null;
                return <><Old /><Modern /></>;
            }
        `);

        assert.deepEqual(messages, []);
    });

    it('не считает type и interface затенением импортированного компонента', async () => {
        const messages = await lint(
            `import { Legacy as Old } from 'arui-private';
            import * as Private from 'arui-private';
            export function WithType() {
                type Old = string;
                return <Old />;
            }
            export function WithInterface() {
                interface Old {}
                return <Old />;
            }
            export function WithNamespaceType() {
                type Private = {};
                return <Private.Legacy />;
            }`,
        );

        assert.deepEqual(
            messages.map((message) => message.line),
            [5, 9, 13],
        );
        assert.equal(
            messages.every((message) => message.messageId === 'deprecatedComponent'),
            true,
        );
    });

    it.each(['@alfalab/core-components/group', 'arui-private/group'])(
        'проверяет deprecated члены составных компонентов из %s',
        async (moduleName) => {
            const messages = await lint(
                `import { Group as Alias } from '${moduleName}';
                import Default from '${moduleName}';
                import * as Private from '${moduleName}';
                export const view = <>
                    <Alias.Old />
                    <Alias.Modern />
                    <Private.Group.Old></Private.Group.Old>
                    <Private.Group.Modern />
                    <Default.Nested.Old />
                    <Private.Group.Nested.Old />
                </>;
                export function Local() {
                    const Alias = { Old: () => null };
                    return <Alias.Old />;
                }`,
                componentOptions,
                `declare module '${moduleName}' {
                    export const Group: {
                        /** @deprecated Используйте Modern */
                        Old: (props: {}) => null;
                        Modern: (props: {}) => null;
                        Nested: {
                            /** @deprecated Используйте Modern */
                            Old: (props: {}) => null;
                        };
                    };
                    export default Group;
                }`,
            );

            assert.deepEqual(
                messages.map((message) => message.line),
                [5, 7, 9, 10],
            );
            assert.equal(
                messages.every(
                    (message) =>
                        message.messageId === 'deprecatedComponent' &&
                        message.message.includes('Используйте Modern'),
                ),
                true,
            );
        },
    );

    it.each(['@alfalab/core-components/button', 'arui-private/button'])(
        'сохраняет @deprecated на промежуточных named и default exports из %s',
        async (moduleName) => {
            const messages = await lint(
                `import { Legacy as Old, Leading, Modern } from '${moduleName}';
                import Default from '${moduleName}';
                import * as Private from '${moduleName}';
                export const view = <>
                    <Old />
                    <Default />
                    <Private.Legacy />
                    <Private.default />
                    <Modern />
                    <Leading />
                </>;`,
                componentOptions,
                `declare module 'ds-internal' {
                    export function Button(): null;
                }
                declare module '${moduleName}/intermediate' {
                    import { Button } from 'ds-internal';
                    export { /** @deprecated Используйте Modern */ Button as Old };
                    /** @deprecated Используйте Modern */
                    export { Button as Leading };
                    /** @deprecated Неоднозначная аннотация для списка */
                    export { Button as Grouped, Button as Modern };
                    /** @deprecated Используйте Modern */
                    export default Button;
                }
                declare module '${moduleName}' {
                    export { Old as Legacy, Leading, Modern } from '${moduleName}/intermediate';
                    export { default } from '${moduleName}/intermediate';
                }`,
            );

            assert.deepEqual(
                messages.map((message) => message.line),
                [5, 6, 7, 8, 10],
            );
            assert.equal(
                messages.every(
                    (message) =>
                        message.messageId === 'deprecatedComponent' &&
                        message.message.includes('Используйте Modern'),
                ),
                true,
            );
        },
    );

    it('предупреждает об устаревшем компоненте при default import', async () => {
        const code = `import Old from 'arui-private'; export const view = <Old />;`;
        const messages = await lint(code);

        assert.equal(messages.length, 1);
        assert.equal(messages[0]?.messageId, 'deprecatedComponent');
        assert.equal(messages[0]?.message.includes('Используйте Modern'), true);
    });

    it('проверяет только выбранную перегрузку в named, namespace и default imports', async () => {
        const messages = await lint(
            `import { Legacy as Old } from 'arui-private';
            import * as Private from 'arui-private';
            import Default from 'arui-private';
            export const view = <>
                <Old modern />
                <Old old />
                <Private.Legacy modern></Private.Legacy>
                <Private.Legacy old></Private.Legacy>
                <Default modern />
                <Default old />
            </>;`,
            componentOptions,
            `declare module 'arui-private' {
                /** @deprecated Используйте modern props */
                export function Legacy(props: { old: true }): null;
                export function Legacy(props: { modern: true }): null;
                /** @deprecated Используйте modern props */
                export default function DefaultLegacy(props: { old: true }): null;
                export default function DefaultLegacy(props: { modern: true }): null;
            }`,
        );

        assert.deepEqual(
            messages.map((message) => message.line),
            [6, 8, 10],
        );
        assert.equal(
            messages.every(
                (message) =>
                    message.messageId === 'deprecatedComponent' &&
                    message.message.includes('Используйте modern props'),
            ),
            true,
        );
    });

    it.each(['@alfalab/core-components/button', 'arui-private/button'])(
        'проверяет выбранную call signature const-компонента из %s',
        async (moduleName) => {
            const messages = await lint(
                `import { Single, Overloaded, Modern } from '${moduleName}';
                import Default from '${moduleName}';
                import * as Private from '${moduleName}';
                export const view = <>
                    <Single />
                    <Overloaded old />
                    <Overloaded modern />
                    <Private.Overloaded old></Private.Overloaded>
                    <Private.Overloaded modern />
                    <Default old />
                    <Default modern />
                    <Modern />
                </>;`,
                componentOptions,
                `declare module '${moduleName}' {
                    interface SingleSignature {
                        /** @deprecated Используйте modern props */
                        (props: {}): null;
                    }
                    interface OverloadedSignatures {
                        /** @deprecated Используйте modern props */
                        (props: { old: true }): null;
                        (props: { modern: true }): null;
                    }
                    export const Single: SingleSignature;
                    export const Overloaded: OverloadedSignatures;
                    export const Modern: (props: {}) => null;
                    export { Overloaded as default };
                }`,
            );

            assert.deepEqual(
                messages.map((message) => message.line),
                [5, 6, 8, 10],
            );
            assert.equal(
                messages.every(
                    (message) =>
                        message.messageId === 'deprecatedComponent' &&
                        message.message.includes('Используйте modern props'),
                ),
                true,
            );
        },
    );

    it('сохраняет аннотацию const-компонента при обычном и перегруженном типе', async () => {
        const messages = await lint(
            `import { LegacyConst, LegacyOverloaded } from 'arui-private';
            export const view = <>
                <LegacyConst />
                <LegacyOverloaded old />
                <LegacyOverloaded modern />
            </>;`,
            componentOptions,
            `declare module 'arui-private' {
                interface FC<Props> { (props: Props): null; }
                /** @deprecated Используйте Modern */
                export const LegacyConst: FC<{}>;
                interface Overloaded {
                    (props: { old: true }): null;
                    (props: { modern: true }): null;
                }
                /** @deprecated Используйте Modern */
                export const LegacyOverloaded: Overloaded;
            }`,
        );

        assert.equal(messages.length, 3);
        assert.equal(
            messages.every(
                (message) =>
                    message.messageId === 'deprecatedComponent' &&
                    message.message.includes('Используйте Modern'),
            ),
            true,
        );
    });
});
