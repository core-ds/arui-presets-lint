import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import { CORE_COMPONENTS_PACKAGE } from '../../eslint/plugins/core-components/constants/index.js';
import { getSplitComponents } from '../../eslint/plugins/core-components/utils/get-split-components.js';

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'core-components-split-'));

type EntryKind = 'dirs' | 'file' | 'component-file' | 'none';

const createPackage = (root: string, entries: Record<string, EntryKind>): void => {
    const pkgDir = path.join(root, 'node_modules', CORE_COMPONENTS_PACKAGE);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
        path.join(pkgDir, 'package.json'),
        JSON.stringify({ name: CORE_COMPONENTS_PACKAGE, version: '0.0.0' }),
    );

    for (const [component, kind] of Object.entries(entries)) {
        const componentDir = path.join(pkgDir, component);
        fs.mkdirSync(componentDir, { recursive: true });

        switch (kind) {
            case 'dirs':
                fs.mkdirSync(path.join(componentDir, 'desktop'));
                fs.mkdirSync(path.join(componentDir, 'mobile'));
                break;
            case 'file':
                fs.writeFileSync(path.join(componentDir, 'desktop.js'), '');
                fs.writeFileSync(path.join(componentDir, 'mobile.js'), '');
                break;
            case 'component-file':
                fs.writeFileSync(path.join(componentDir, 'Component.desktop.js'), '');
                fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');
                break;
            default:
                break;
        }
    }
};

const componentDirOf = (root: string, component: string): string =>
    path.join(root, 'node_modules', CORE_COMPONENTS_PACKAGE, component);

afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
});

describe('getSplitComponents', () => {
    it('распознаёт сплит по подкаталогам desktop/ и mobile/', () => {
        const root = path.join(tempRoot, 'dirs');
        createPackage(root, { button: 'dirs' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
    });

    it('распознаёт сплит по файлам desktop.js и mobile.js в корне', () => {
        const root = path.join(tempRoot, 'files');
        createPackage(root, { select: 'file' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('select');
    });

    it('распознаёт сплит по файлам Component.desktop.js и Component.mobile.js', () => {
        const root = path.join(tempRoot, 'component-files');
        createPackage(root, { alert: 'component-file' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('alert');
    });

    it('распознаёт сплит по файлам <Component>.desktop.js и <Component>.mobile.js', () => {
        const root = path.join(tempRoot, 'named-files');
        createPackage(root, { toast: 'none' });
        const componentDir = componentDirOf(root, 'toast');
        fs.writeFileSync(path.join(componentDir, 'Toast.desktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'Toast.mobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('toast');
    });

    it('распознаёт сплит при смешанном представлении (папка desktop + файл mobile)', () => {
        const root = path.join(tempRoot, 'mixed');
        createPackage(root, { modal: 'none' });
        const componentDir = componentDirOf(root, 'modal');
        fs.mkdirSync(path.join(componentDir, 'desktop'));
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('modal');
    });

    it('не считает сплитнутым компонент с только одним файлом (mobile без desktop)', () => {
        const root = path.join(tempRoot, 'partial');
        createPackage(root, { themes: 'none' });
        const componentDir = componentDirOf(root, 'themes');
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).not.toContain('themes');
    });

    it('не считает сплитнутым helper-файл useIsDesktop.js (платформа в имени без разделителя)', () => {
        const root = path.join(tempRoot, 'helper');
        createPackage(root, { mq: 'none' });
        const componentDir = componentDirOf(root, 'mq');
        fs.writeFileSync(path.join(componentDir, 'useIsDesktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'useIsMobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).not.toContain('mq');
    });

    it('не считает .d.ts маркером сплита (печатные типы исключены)', () => {
        const root = path.join(tempRoot, 'types-only');
        createPackage(root, { accordion: 'none' });
        const componentDir = componentDirOf(root, 'accordion');
        fs.writeFileSync(path.join(componentDir, 'Component.desktop.d.ts'), '');
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.d.ts'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).not.toContain('accordion');
    });

    it('распознаёт сплит при платформенном файле в верхнем регистре (Component.Desktop.js)', () => {
        const root = path.join(tempRoot, 'ci-files');
        createPackage(root, { tag: 'none' });
        const componentDir = componentDirOf(root, 'tag');
        fs.writeFileSync(path.join(componentDir, 'Tag.Desktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'Tag.Mobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('tag');
    });
});
