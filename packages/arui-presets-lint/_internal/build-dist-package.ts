// Генерирует dist/package.json из исходного package.json,
// заменяя пути в exports с `.ts`-исходников на собранные `.js` + `.d.ts`
// и разрешая `workspace:*` ссылки на реальные версии пакетов.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildDistPackageJson, type Deps, type PackageJson } from './dist-package.js';

const sourcePkg = JSON.parse(await readFile('package.json', 'utf8')) as PackageJson;

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

const distPkg = buildDistPackageJson(
    sourcePkg,
    await resolveWorkspaceDeps(sourcePkg.dependencies as Deps),
);

await writeFile('dist/package.json', `${JSON.stringify(distPkg, null, 4)}\n`);
