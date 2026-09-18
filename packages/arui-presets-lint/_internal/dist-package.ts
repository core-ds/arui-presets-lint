// Чистые (без файлового ввода-вывода) преобразования исходного package.json
// в публикуемый dist/package.json. Вынесено отдельно, чтобы покрыть тестами
// без сайд-эффектов сборочного скрипта.

export type ExportTarget = string | { types: string; import: string };
export type Deps = Record<string, string>;
export type PackageJson = {
    exports: Record<string, ExportTarget>;
    [key: string]: unknown;
};

// Публикуемый набор скриптов: единственный postinstall — тонкая обёртка,
// синхронизирующая блок правил в AGENTS.md потребителя. Путь совпадает с `bin`
// (относительно корня dist). Исходные build/test/lint исключаются намеренно:
// они ссылаются на dev-зависимости (tsx/rimraf/copyfiles), которых нет в
// установке потребителя.
export const DIST_SCRIPTS = {
    postinstall: 'node cli/postinstall.mjs',
} as const;

/**
 * Заменяет пути в `exports` с `.ts`-исходников на собранные `.js` + `.d.ts`.
 * Записи, не указывающие на `.ts`-файл, остаются без изменений.
 */
export function rewriteExports(
    exports: Record<string, ExportTarget>,
): Record<string, ExportTarget> {
    return Object.fromEntries(
        Object.entries(exports).map(([subpath, target]): [string, ExportTarget] => {
            if (typeof target !== 'string' || !target.endsWith('.ts')) {
                return [subpath, target];
            }

            const jsTarget = target.replace(/\.ts$/, '.js');
            const dtsTarget = target.replace(/\.ts$/, '.d.ts');

            return [subpath, { types: dtsTarget, import: jsTarget }];
        }),
    );
}

/**
 * Собирает публикуемый package.json: переписанные exports, разрешённые
 * зависимости, пустые devDependencies и минимальный набор скриптов с
 * postinstall-хуком.
 */
export function buildDistPackageJson(
    sourcePkg: PackageJson,
    resolvedDependencies: Deps | undefined,
): PackageJson {
    return {
        ...sourcePkg,
        exports: rewriteExports(sourcePkg.exports),
        dependencies: resolvedDependencies,
        // devDeps в релизной версии не нужны
        devDependencies: {},
        scripts: { ...DIST_SCRIPTS },
    };
}
