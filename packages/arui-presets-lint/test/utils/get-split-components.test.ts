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
    it('возвращает компонент, если у него есть подкаталоги desktop/ и mobile/', () => {
        const root = path.join(tempRoot, 'dirs');
        createPackage(root, { button: 'dirs' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
    });

    it('возвращает компонент, если в его корне есть файлы desktop.js и mobile.js', () => {
        const root = path.join(tempRoot, 'files');
        createPackage(root, { select: 'file' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('select');
    });

    it('возвращает компонент, если в его корне есть файлы Component.desktop.js и Component.mobile.js', () => {
        const root = path.join(tempRoot, 'component-files');
        createPackage(root, { alert: 'component-file' });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('alert');
    });

    it('возвращает компонент, если в его корне есть файлы <Component>.desktop.js и <Component>.mobile.js', () => {
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

    it('возвращает компонент при смешанном представлении платформ (папка desktop + файл mobile)', () => {
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

    it('не возвращает компонент, если есть только одна платформа (mobile без desktop)', () => {
        const root = path.join(tempRoot, 'partial');
        createPackage(root, { themes: 'none' });
        const componentDir = componentDirOf(root, 'themes');
        fs.writeFileSync(path.join(componentDir, 'Component.mobile.js'), '');
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).not.toContain('themes');
    });

    it('не возвращает компонент по helper-файлам useIsDesktop.js и useIsMobile.js (платформа без разделителя)', () => {
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

    it('не возвращает компонент по .d.ts-файлам (печатные типы исключены)', () => {
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

    it('возвращает пустой список, если нет ни агрегатора, ни отдельных подпакетов', () => {
        const root = path.join(tempRoot, 'no-package');
        fs.mkdirSync(root, { recursive: true });
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toEqual([]);
    });

    it('определяет компонент из отдельного подпакета, если агрегатор не установлен', () => {
        const root = path.join(tempRoot, 'standalone-only');
        const scopeDir = path.join(root, 'node_modules', '@alfalab');
        const buttonDir = path.join(scopeDir, 'core-components-button');
        fs.mkdirSync(path.join(buttonDir, 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(buttonDir, 'mobile'), { recursive: true });
        fs.writeFileSync(
            path.join(buttonDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-button', version: '0.0.0' }),
        );
        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
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

        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
    });

    it('пропускает ближний scope без core-components и находит подпакет выше по дереву', () => {
        const root = path.join(tempRoot, 'nested-scope');

        // дальний scope с подпакетом core-components
        const farScopeDir = path.join(root, 'node_modules', '@alfalab');
        const buttonDir = path.join(farScopeDir, 'core-components-button');
        fs.mkdirSync(path.join(buttonDir, 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(buttonDir, 'mobile'), { recursive: true });
        fs.writeFileSync(
            path.join(buttonDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-button', version: '0.0.0' }),
        );

        // ближний scope без core-components (например, только icons)
        const appDir = path.join(root, 'packages', 'app');
        fs.mkdirSync(path.join(appDir, 'node_modules', '@alfalab', 'icons'), { recursive: true });

        const entry = path.join(appDir, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
    });

    it('учитывает ближнюю установку подпакета, даже если дальняя версия разделена на платформы', () => {
        const root = path.join(tempRoot, 'nested-shadow');

        // дальний scope: подпакет core-components-button с разделением на платформы
        const farScopeDir = path.join(root, 'node_modules', '@alfalab');
        const farButtonDir = path.join(farScopeDir, 'core-components-button');
        fs.mkdirSync(path.join(farButtonDir, 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(farButtonDir, 'mobile'), { recursive: true });
        fs.writeFileSync(
            path.join(farButtonDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-button', version: '0.0.0' }),
        );

        // ближний scope: тот же компонент без разделения на платформы
        const appDir = path.join(root, 'packages', 'app');
        const nearButtonDir = path.join(
            appDir,
            'node_modules',
            '@alfalab',
            'core-components-button',
        );
        fs.mkdirSync(nearButtonDir, { recursive: true });
        fs.writeFileSync(
            path.join(nearButtonDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-button', version: '0.0.0' }),
        );

        const entry = path.join(appDir, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).not.toContain('button');
    });

    it('при установленном агрегаторе берёт список только из него и игнорирует отдельные подпакеты', () => {
        const root = path.join(tempRoot, 'aggregate-priority');

        // агрегатор: button с разделением на платформы, link — без
        const aggregateDir = path.join(root, 'node_modules', '@alfalab', 'core-components');
        fs.mkdirSync(path.join(aggregateDir, 'button', 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(aggregateDir, 'button', 'mobile'), { recursive: true });
        fs.mkdirSync(path.join(aggregateDir, 'link'), { recursive: true });
        fs.writeFileSync(
            path.join(aggregateDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components', version: '0.0.0' }),
        );

        // отдельный подпакет: select разделён на платформы, но при наличии агрегатора
        // он не должен попадать в список
        const standaloneDir = path.join(root, 'node_modules', '@alfalab', 'core-components-select');
        fs.mkdirSync(path.join(standaloneDir, 'desktop'), { recursive: true });
        fs.mkdirSync(path.join(standaloneDir, 'mobile'), { recursive: true });
        fs.writeFileSync(
            path.join(standaloneDir, 'package.json'),
            JSON.stringify({ name: '@alfalab/core-components-select', version: '0.0.0' }),
        );

        const entry = path.join(root, 'entry.ts');
        fs.writeFileSync(entry, '');

        const components = getSplitComponents(entry);

        expect(components).toContain('button');
        expect(components).not.toContain('link');
        expect(components).not.toContain('select');
    });

    it('возвращает компонент по платформенным файлам в верхнем регистре (Tag.Desktop.js)', () => {
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
