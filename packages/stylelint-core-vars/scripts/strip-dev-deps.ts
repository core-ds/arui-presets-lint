// Удаляем devDependencies перед публикацией
// Для того чтобы зависимости с версией `workspace:*` не попали в релиз

import { readFile, writeFile } from 'node:fs/promises';

const pkgPath = 'package.json';
const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as Record<string, unknown>;

pkg.devDependencies = {};

await writeFile(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);
