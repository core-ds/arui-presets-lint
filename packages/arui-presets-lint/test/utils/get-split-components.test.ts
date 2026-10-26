import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

import { CORE_COMPONENTS_PACKAGE } from '../../eslint/plugins/core-components/constants/index.js';
import { getSplitComponentsByForm } from '../../eslint/plugins/core-components/utils/get-split-components.js';

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

const createStandalonePackage = (
    root: string,
    component: string,
    kind: EntryKind = 'dirs',
): string => {
    const pkgDir = path.join(root, 'node_modules', '@alfalab', `core-components-${component}`);
    fs.mkdirSync(pkgDir, { recursive: true });
    fs.writeFileSync(
        path.join(pkgDir, 'package.json'),
        JSON.stringify({ name: `@alfalab/core-components-${component}`, version: '0.0.0' }),
    );

    switch (kind) {
        case 'dirs':
            fs.mkdirSync(path.join(pkgDir, 'desktop'));
            fs.mkdirSync(path.join(pkgDir, 'mobile'));
            break;
        case 'file':
            fs.writeFileSync(path.join(pkgDir, 'desktop.js'), '');
            fs.writeFileSync(path.join(pkgDir, 'mobile.js'), '');
            break;
        default:
            break;
    }

    return pkgDir;
};

const componentDirOf = (root: string, component: string): string =>
    path.join(root, 'node_modules', CORE_COMPONENTS_PACKAGE, component);

const entryOf = (root: string): string => {
    const entry = path.join(root, 'entry.ts');
    fs.writeFileSync(entry, '');

    return entry;
};

const getAggregator = (entry: string): ReadonlySet<string> =>
    getSplitComponentsByForm(entry).aggregator;

const getStandalone = (entry: string): ReadonlySet<string> =>
    getSplitComponentsByForm(entry).standalone;

afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
});

describe('getSplitComponentsByForm / aggregator', () => {
    it('возвращает компонент, если у него есть подкаталоги desktop/ и mobile/', () => {
        const root = path.join(tempRoot, 'dirs');
        createPackage(root, { button: 'dirs' });

        expect([...getAggregator(entryOf(root))]).toContain('button');
    });

    it('возвращает компонент, если в его корне есть файлы desktop.js и mobile.js', () => {
        const root = path.join(tempRoot, 'files');
        createPackage(root, { select: 'file' });

        expect([...getAggregator(entryOf(root))]).toContain('select');
    });

    it('возвращает компонент, если в его корне есть файлы Component.desktop.js и Component.mobile.js', () => {
        const root = path.join(tempRoot, 'component-files');
        createPackage(root, { alert: 'component-file' });

        expect([...getAggregator(entryOf(root))]).toContain('alert');
    });

    it('возвращает компонент, если в его корне есть файлы <Component>.desktop.js и <Component>.mobile.js', () => {
        const root = path.join(tempRoot, 'named-files');
        createPackage(root, { toast: 'none' });
        const componentDir = componentDirOf(root, 'toast');
        fs.writeFileSync(path.join(componentDir, 'Toast.desktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'Toast.mobile.js'), '');

        expect([...getAggregator(entryOf(root))]).toContain('toast');
    });

    it('возвращает компонент при смешанном представлении платформ (папка desktop + файл mobile)', () => {
        const root = path.join(tempRoot, 'mixed');
        createPackage(root, { modal: 'none' });
        const componentDir = componentDirOf(root, 'modal');
        fs.mkdirSync(path.join(componentDir, 'desktop'));
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');

        expect([...getAggregator(entryOf(root))]).toContain('modal');
    });

    it('не возвращает компонент, если есть только одна платформа (mobile без desktop)', () => {
        const root = path.join(tempRoot, 'partial');
        createPackage(root, { themes: 'none' });
        const componentDir = componentDirOf(root, 'themes');
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');

        expect([...getAggregator(entryOf(root))]).not.toContain('themes');
    });

    it('не возвращает компонент по helper-файлам useIsDesktop.js и useIsMobile.js (платформа без разделителя)', () => {
        const root = path.join(tempRoot, 'helper');
        createPackage(root, { mq: 'none' });
        const componentDir = componentDirOf(root, 'mq');
        fs.writeFileSync(path.join(componentDir, 'useIsDesktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'useIsMobile.js'), '');

        expect([...getAggregator(entryOf(root))]).not.toContain('mq');
    });

    it('не возвращает компонент по .d.ts-файлам (печатные типы исключены)', () => {
        const root = path.join(tempRoot, 'types-only');
        createPackage(root, { accordion: 'none' });
        const componentDir = componentDirOf(root, 'accordion');
        fs.writeFileSync(path.join(componentDir, 'Component.desktop.d.ts'), '');
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.d.ts'), '');

        expect([...getAggregator(entryOf(root))]).not.toContain('accordion');
    });

    it('возвращает пустой набор, если агрегатор не установлен', () => {
        const root = path.join(tempRoot, 'no-package');
        fs.mkdirSync(root, { recursive: true });

        expect([...getAggregator(entryOf(root))]).toEqual([]);
    });

    it('возвращает компонент по платформенным файлам в верхнем регистре (Tag.Desktop.js)', () => {
        const root = path.join(tempRoot, 'ci-files');
        createPackage(root, { tag: 'none' });
        const componentDir = componentDirOf(root, 'tag');
        fs.writeFileSync(path.join(componentDir, 'Tag.Desktop.js'), '');
        fs.writeFileSync(path.join(componentDir, 'Tag.Mobile.js'), '');

        expect([...getAggregator(entryOf(root))]).toContain('tag');
    });
});

describe('getSplitComponentsByForm / standalone', () => {
    it('определяет компонент из отдельного подпакета, если агрегатор не установлен', () => {
        const root = path.join(tempRoot, 'standalone-only');
        createStandalonePackage(root, 'button');

        const entry = entryOf(root);

        expect([...getStandalone(entry)]).toContain('button');
        expect([...getAggregator(entry)]).toEqual([]);
    });

    it('определяет компонент из симлинк-подпакета, если агрегатор не установлен', () => {
        const root = path.join(tempRoot, 'standalone-symlink');
        const scopeDir = path.join(root, 'node_modules', '@alfalab');
        fs.mkdirSync(scopeDir, { recursive: true });

        const realDir = path.join(tempRoot, 'store', 'core-components-button');
        fs.mkdirSync(path.join(realDir, 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(realDir, 'mobile'), { recursive: true });
        fs.writeFileSync(
            path.join(realDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-button', version: '0.0.0' }),
        );

        fs.symlinkSync(realDir, path.join(scopeDir, 'core-components-button'), 'junction');

        expect([...getStandalone(entryOf(root))]).toContain('button');
    });

    it('пропускает ближний scope без core-components и находит подпакет выше по дереву', () => {
        const root = path.join(tempRoot, 'nested-scope');

        // дальний scope с подпакетом core-components
        createStandalonePackage(root, 'button');

        // ближний scope без core-components (например, только icons)
        const appDir = path.join(root, 'packages', 'app');
        fs.mkdirSync(path.join(appDir, 'node_modules', '@alfalab', 'icons'), { recursive: true });

        expect([...getStandalone(entryOf(appDir))]).toContain('button');
    });

    it('учитывает ближнюю установку подпакета, даже если дальняя версия разделена на платформы', () => {
        const root = path.join(tempRoot, 'nested-shadow');

        // дальний scope: подпакет core-components-button с разделением на платформы
        createStandalonePackage(root, 'button');

        // ближний scope: тот же компонент без разделения на платформы
        const appDir = path.join(root, 'packages', 'app');
        createStandalonePackage(appDir, 'button', 'none');

        expect([...getStandalone(entryOf(appDir))]).not.toContain('button');
    });

    it('определяет standalone-компонент, даже если агрегатор установлен и этот компонент в нём не разделён', () => {
        const root = path.join(tempRoot, 'aggregator-not-split');

        // агрегатор: button ещё не разделён на платформы, link разделён
        createPackage(root, { button: 'none', link: 'dirs' });

        // отдельный подпакет button уже разделён на платформы
        createStandalonePackage(root, 'button');

        const entry = entryOf(root);

        expect([...getAggregator(entry)]).toContain('link');
        expect([...getAggregator(entry)]).not.toContain('button');
        expect([...getStandalone(entry)]).toContain('button');
    });

    it('не определяет standalone-компонент, если разделён только агрегатор', () => {
        const root = path.join(tempRoot, 'aggregator-split-only');

        // агрегатор: select разделён на платформы
        createPackage(root, { select: 'dirs' });

        // отдельный подпакет select ещё не разделён
        createStandalonePackage(root, 'select', 'none');

        const entry = entryOf(root);

        expect([...getAggregator(entry)]).toContain('select');
        expect([...getStandalone(entry)]).not.toContain('select');
    });
});
