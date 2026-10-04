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

async function lint(code: string, options: DesignSystemOptions = {}, typed = true) {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'arui-ds-integration-'));
    try {
        const file = path.join(cwd, 'example.tsx');
        const declarations = path.join(cwd, 'ds.d.ts');
        await writeFile(file, code);
        await writeFile(
            declarations,
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
    it('находит @deprecated у алиаса и namespace import', async () => {
        const messages = await lint(`
            import { Legacy as Old } from 'arui-private';
            import * as Private from 'arui-private';
            export const view = <><Old /><Private.Legacy /></>;
        `);
        assert.equal(messages.length, 2);
        assert.equal(
            messages.every(
                (message) => message.ruleId === 'design-system/no-deprecated-components',
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

    it('проверяет default import и сообщает об отсутствии типов', async () => {
        const code = `import Old from 'arui-private'; export const view = <Old />;`;
        const messages = await lint(code);
        assert.equal(messages[0]?.messageId, 'deprecatedComponent');
        assert.equal(messages[0]?.message.includes('Используйте Modern'), true);
        const withoutTypes = await lint(code, {}, false);
        assert.equal(withoutTypes.length, 1);
        assert.equal(withoutTypes[0]?.messageId, 'missingTypes');
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
