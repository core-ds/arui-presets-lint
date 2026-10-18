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

async function lint(
    code: string,
    options: DesignSystemOptions = {},
    typed = true,
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
                        parserOptions: typed
                            ? { programs: [program], tsconfigRootDir: cwd }
                            : { ecmaFeatures: { jsx: true } },
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

describe('интеграция DS-правил с TypeScript', () => {
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

    it('сохраняет проверки namespace imports и props в JSX без TypeScript', async () => {
        const eslint = new ESLint({
            overrideConfigFile: true,
            overrideConfig: [
                {
                    files: ['**/*.jsx'],
                    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
                },
                ...createDesignSystemConfig({
                    deprecatedComponents: false,
                    deprecatedApis: [{ module: 'arui-private', export: 'Legacy' }],
                    deprecatedProps: [
                        { module: 'arui-private', component: 'Modern', prop: 'oldSize' },
                    ],
                    accessibleNames: [{ module: 'arui-private', component: 'Modern' }],
                }),
            ],
        });
        const [result] = await eslint.lintText(
            `import { Modern } from 'arui-private';
            import * as Private from 'arui-private';
            Private.Legacy();
            export const view = <>
                <Modern oldSize="s" />
                <Private.Modern oldSize="s" />
                <Modern aria-label="Закрыть" />
            </>;`,
            { filePath: 'example.jsx' },
        );
        assert.deepEqual(result.messages.map((message) => message.ruleId).toSorted(), [
            'design-system/no-deprecated-api',
            'design-system/no-deprecated-props',
            'design-system/no-deprecated-props',
            'design-system/require-accessible-name',
            'design-system/require-accessible-name',
        ]);
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
                {},
                true,
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
                `import { Legacy as Old, Modern } from '${moduleName}';
                import Default from '${moduleName}';
                import * as Private from '${moduleName}';
                export const view = <>
                    <Old />
                    <Default />
                    <Private.Legacy />
                    <Private.default />
                    <Modern />
                </>;`,
                {},
                true,
                `declare module 'ds-internal' {
                    export function Button(): null;
                }
                declare module '${moduleName}/intermediate' {
                    import { Button } from 'ds-internal';
                    export { /** @deprecated Используйте Modern */ Button as Old };
                    /** @deprecated Используйте Modern */
                    export default Button;
                }
                declare module '${moduleName}' {
                    export { Old as Legacy } from '${moduleName}/intermediate';
                    export { default } from '${moduleName}/intermediate';
                    export { Button as Modern } from 'ds-internal';
                }`,
            );
            assert.deepEqual(
                messages.map((message) => message.line),
                [5, 6, 7, 8],
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

    it('проверяет default import и сообщает об отсутствии типов', async () => {
        const code = `import Old from 'arui-private'; export const view = <Old />;`;
        const messages = await lint(code);
        assert.equal(messages[0]?.messageId, 'deprecatedComponent');
        assert.equal(messages[0]?.message.includes('Используйте Modern'), true);
        const withoutTypes = await lint(code, {}, false);
        assert.equal(withoutTypes.length, 1);
        assert.equal(withoutTypes[0]?.messageId, 'missingTypes');
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
            {},
            true,
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
                {},
                true,
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
            {},
            true,
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

    it('отклоняет статически пустые имена и раскрывает TypeScript-обёртки', async () => {
        const emptyValues = [
            '` `',
            '``',
            '`\\n`',
            'void 0',
            'null!',
            "'' as string",
            "('' as string)!",
            "'' satisfies string",
            '(undefined as string)!',
        ];
        const validValues = [
            '`Сохранить`',
            "'Сохранить' as string",
            'label!',
            'label as string',
            // eslint-disable-next-line no-template-curly-in-string -- Проверяем исходный код шаблона с динамической подстановкой.
            '`Сохранить ${label}`',
        ];
        const messages = await lint(
            `import { Modern as Button } from 'arui-private';
            const label = 'Сохранить';
            export const view = <>
                ${[...emptyValues, ...validValues]
                    .map((value) => `<Button aria-label={${value}} />`)
                    .join('\n')}
                <Button aria-labelledby={\`\`} />
                <Button aria-label={\`\`} aria-labelledby="name" />
            </>;`,
            {
                deprecatedComponents: false,
                accessibleNames: [{ module: 'arui-private', component: 'Modern' }],
            },
        );
        assert.equal(messages.length, emptyValues.length + 1);
        assert.equal(
            messages.every((message) => message.messageId === 'missingLabel'),
            true,
        );
    });

    it('проверяет реэкспорт и вычисляемые обращения к namespace', async () => {
        const messages = await lint(
            `import Old from 'arui-private';
            import * as Private from 'arui-private';
            export { Legacy as OldNamed } from 'arui-private';
            export { Old };
            Private['Legacy']();
            const key = 'Legacy';
            Private[key]();
            export const view = <><Private.Legacy /><Private.Modern /></>;`,
            {
                deprecatedComponents: false,
                deprecatedApis: [
                    { module: 'arui-private', export: 'default' },
                    { module: 'arui-private', export: 'Legacy', replacement: 'Modern' },
                ],
            },
        );
        assert.equal(messages.length, 4);
        assert.equal(
            messages.every((message) => message.messageId === 'deprecated'),
            true,
        );
    });

    it('отличает пустое доступное имя от строки и динамического значения', async () => {
        const messages = await lint(
            `import { Modern as Button } from 'arui-private';
            const label = 'Сохранить';
            export const view = <>
                <Button aria-label />
                <Button aria-label={' '} />
                <Button aria-label={null} />
                <Button aria-label={undefined} />
                <Button aria-label={/* пустое выражение */} />
                <Button aria-label={label} />
                <Button aria-label={'Сохранить'} />
                <Button aria-label="Сохранить" />
                <Button oldSize="s" />
            </>;`,
            {
                deprecatedComponents: false,
                deprecatedProps: [{ module: 'arui-private', component: 'Modern', prop: 'oldSize' }],
                accessibleNames: [{ module: 'arui-private', component: 'Modern' }],
            },
        );
        assert.equal(messages.filter((message) => message.messageId === 'missingLabel').length, 6);
        assert.equal(
            messages.filter((message) => message.messageId === 'deprecatedProp').length,
            1,
        );
    });
});
