// Генерирует dist/package.json из исходного package.json,
// заменяя пути в exports с `.ts`-исходников на собранные `.js` + `.d.ts`
// и разрешая `workspace:*` ссылки на реальные версии пакетов.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ExportConditions = {
    types?: string;
    import?: string;
    require?: string;
    default?: string;
};
type ExportTarget = string | ExportConditions;
type Deps = Record<string, string>;
type PackageJson = { exports: Record<string, ExportTarget>; [key: string]: unknown };

const sourcePkg = JSON.parse(await readFile('package.json', 'utf8')) as PackageJson;

/**
 * Добавляем `default` (тот же ESM-файл, что и `import`) только для resolve:
 * CJS резолверы вроде require.resolve / resolve-from иначе не находят subpath
 * (например arui-presets-lint/commitlint).
 */
const withResolvableConditions = (jsTarget: string, dtsTarget: string): ExportConditions => ({
    types: dtsTarget,
    import: jsTarget,
    default: jsTarget,
});

const toDistExport = (target: ExportTarget): ExportTarget => {
    if (typeof target === 'string') {
        if (!target.endsWith('.ts')) {
            return target;
        }

        const jsTarget = target.replace(/\.ts$/, '.js');
        const dtsTarget = target.replace(/\.ts$/, '.d.ts');

        return withResolvableConditions(jsTarget, dtsTarget);
    }

    if (target.import && !target.default) {
        return {
            ...target,
            default: target.import,
        };
    }

    return target;
};

const distExports = Object.fromEntries(
    Object.entries(sourcePkg.exports).map(([subpath, target]): [string, ExportTarget] => [
        subpath,
        toDistExport(target),
    ]),
);

async function resolveWorkspaceDeps(deps: Deps | undefined): Promise<Deps | undefined> {
    if (!deps) return deps;

    const resolved = { ...deps };

    const workspaceEntries = Object.entries(resolved).filter(([, version]) =>
        version.startsWith('workspace:'),
    );

    const versions = await Promise.all(
        workspaceEntries.map(async ([name]) => {
            const pkgPath = path.resolve('..', name.replace(/^@[^/]+\//, ''), 'package.json');
            const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as PackageJson;

            return pkg.version as string;
        }),
    );

    for (const [i, [name]] of workspaceEntries.entries()) {
        resolved[name] = `${versions[i]}`;
    }

    return resolved;
}

const distPkg: PackageJson = {
    ...sourcePkg,
    exports: distExports,
    dependencies: await resolveWorkspaceDeps(sourcePkg.dependencies as Deps),
    // devDeps в релизной версии не нужны
    devDependencies: {},
};

await writeFile('dist/package.json', `${JSON.stringify(distPkg, null, 4)}\n`);
