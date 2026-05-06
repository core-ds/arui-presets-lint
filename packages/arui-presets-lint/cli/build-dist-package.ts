// Генерирует dist/package.json из исходного package.json,
// заменяя пути в exports с `.ts`-исходников на собранные `.js` + `.d.ts`
// и разрешая `workspace:*` ссылки на реальные версии пакетов.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type ExportTarget = string | { types: string; import: string };
type Deps = Record<string, string>;
type PackageJson = { exports: Record<string, ExportTarget>; [key: string]: unknown };

const sourcePkg = JSON.parse(await readFile('package.json', 'utf8')) as PackageJson;

const distExports = Object.fromEntries(
    Object.entries(sourcePkg.exports).map(([subpath, target]): [string, ExportTarget] => {
        if (typeof target !== 'string' || !target.endsWith('.ts')) {
            return [subpath, target];
        }

        const jsTarget = target.replace(/\.ts$/, '.js');
        const dtsTarget = target.replace(/\.ts$/, '.d.ts');

        return [subpath, { types: dtsTarget, import: jsTarget }];
    }),
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
