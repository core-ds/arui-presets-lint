/** Пакет-агрегатор core-components: @alfalab/core-components/<pkg>/desktop|mobile. */
export const CORE_COMPONENTS_PACKAGE = '@alfalab/core-components';

/** Префикс отдельного подпакета: @alfalab/core-components-<pkg>[/desktop|/mobile]. */
export const STANDALONE_PREFIX = `${CORE_COMPONENTS_PACKAGE}-`;

/** Форма импорта компонента: через агрегатор или через отдельный подпакет. */
export type CoreComponentsImportForm = 'aggregator' | 'standalone';

/** Платформенные подкаталоги, в которых живут разделённые на платформы компоненты. */
export const PLATFORM_DIRS = ['desktop', 'mobile'] as const;

/**
 * Рантайм-расширения файлов-маркеров платформы в корне компонента.
 * Печатные типы (.d.ts) намеренно исключены: правило проверяет только рантайм-импорты.
 */
export const PLATFORM_FILE_EXTENSIONS = [
    '.ts',
    '.tsx',
    '.mtsx',
    '.js',
    '.jsx',
    '.mjsx',
    '.mjs',
    '.mts',
    '.cjs',
    '.cts',
] as const;
