import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        include: ['test/**/*.test.ts'],
        coverage: {
            enabled: true,
            provider: 'istanbul',
            reporter: ['text', 'json', 'lcov'],
            include: ['index.ts', 'lib/**'],
            exclude: [...configDefaults.exclude],
        },
        exclude: [...configDefaults.exclude],
        clearMocks: true,
    },
});
