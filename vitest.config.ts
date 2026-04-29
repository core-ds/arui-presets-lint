import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        coverage: {
            enabled: true,
            provider: 'istanbul',
            reporter: ['text', 'json', 'lcov'],
            thresholds: {
                statements: 90,
                functions: 90,
                branches: 85,
                lines: 90,
            },
            exclude: [...configDefaults.exclude],
        },
        exclude: [...configDefaults.exclude],
        clearMocks: true,
    },
});
