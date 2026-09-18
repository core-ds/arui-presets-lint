import { describe, expect, it } from 'vitest';

import {
    buildDistPackageJson,
    type Deps,
    DIST_SCRIPTS,
    type PackageJson,
    rewriteExports,
} from '../_internal/dist-package.js';

// package.json без секции dependencies → resolveWorkspaceDeps возвращает undefined
const NO_DEPS: Deps | undefined = undefined;

describe('rewriteExports', () => {
    it('rewrites `.ts` targets to `.js` + `.d.ts` pairs', () => {
        expect(rewriteExports({ './eslint': './eslint/index.ts' })).toEqual({
            './eslint': { types: './eslint/index.d.ts', import: './eslint/index.js' },
        });
    });

    it('leaves non-`.ts` string targets untouched', () => {
        const exports = { './prettier': './prettier/index.js' };

        expect(rewriteExports(exports)).toEqual(exports);
    });

    it('leaves object targets untouched', () => {
        const exports = {
            './prettier': { types: './prettier/index.d.ts', import: './prettier/index.js' },
        };

        expect(rewriteExports(exports)).toEqual(exports);
    });
});

describe('buildDistPackageJson', () => {
    const sourcePkg: PackageJson = {
        name: 'arui-presets-lint',
        version: '1.2.3',
        exports: { './eslint': './eslint/index.ts' },
        dependencies: { execa: '^9.6.1' },
        devDependencies: { tsx: '4.22.4' },
        scripts: {
            build: 'rimraf dist && tsc && copyfiles ... dist && tsx _internal/build-dist-package.ts',
            test: 'tsc --noEmit && tsx _internal/duplicates-checker.ts',
            'lint:scripts': 'tsx ./cli/index.mts scripts',
        },
    };

    it('injects only the postinstall script, dropping source scripts', () => {
        const dist = buildDistPackageJson(sourcePkg, { execa: '^9.6.1' });

        expect(dist.scripts).toEqual({ postinstall: 'node cli/postinstall.mjs' });
        expect(dist.scripts).toEqual(DIST_SCRIPTS);
    });

    it('does not leak dev-only tooling (tsx/rimraf/copyfiles) into published scripts', () => {
        const dist = buildDistPackageJson(sourcePkg, { execa: '^9.6.1' });
        const scriptValues = Object.values(dist.scripts as Record<string, string>).join(' ');

        expect(scriptValues).not.toMatch(/\b(tsx|rimraf|copyfiles)\b/);
    });

    it('the postinstall path matches the published bin layout', () => {
        const dist = buildDistPackageJson(sourcePkg, NO_DEPS);

        expect((dist.scripts as Record<string, string>).postinstall).toBe(
            'node cli/postinstall.mjs',
        );
    });

    it('blanks devDependencies', () => {
        const dist = buildDistPackageJson(sourcePkg, { execa: '^9.6.1' });

        expect(dist.devDependencies).toEqual({});
    });

    it('uses the resolved dependencies verbatim', () => {
        const resolved = { execa: '9.6.1', '@alfalab/stylelint-core-vars': '2.0.0' };
        const dist = buildDistPackageJson(sourcePkg, resolved);

        expect(dist.dependencies).toEqual(resolved);
    });

    it('rewrites exports as part of the assembly', () => {
        const dist = buildDistPackageJson(sourcePkg, NO_DEPS);

        expect(dist.exports).toEqual({
            './eslint': { types: './eslint/index.d.ts', import: './eslint/index.js' },
        });
    });

    it('preserves other top-level fields', () => {
        const dist = buildDistPackageJson(sourcePkg, NO_DEPS);

        expect(dist.name).toBe('arui-presets-lint');
        expect(dist.version).toBe('1.2.3');
    });
});
