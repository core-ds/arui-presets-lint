// Генерирует dist/package.json из исходного package.json,
// заменяя пути в exports с `.ts`-исходников на собранные `.js` + `.d.ts`.

import { readFile, writeFile } from 'node:fs/promises';

type ExportTarget = string | { types: string; import: string };
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

const distPkg: PackageJson = { ...sourcePkg, exports: distExports };

await writeFile('dist/package.json', `${JSON.stringify(distPkg, null, 4)}\n`);
