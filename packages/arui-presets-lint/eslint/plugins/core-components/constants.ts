/**
 * Пакет-агрегатор design-системы core-components.
 * Импорты платформенных вариантов идут как @alfalab/core-components/<pkg>/desktop|mobile.
 */
export const CORE_COMPONENTS_PACKAGE = '@alfalab/core-components';

/**
 * Префикс отдельного подпакета core-components.
 * Импорты выглядят как @alfalab/core-components-<pkg>[/desktop|/mobile].
 */
export const STANDALONE_PREFIX = `${CORE_COMPONENTS_PACKAGE}-`;

/**
 * Форма импорта компонента: через агрегатор или через отдельный подпакет.
 */
export const IMPORT_FORM = {
    AGGREGATOR: 'aggregator',
    STANDALONE: 'standalone',
} as const;

export type CoreComponentsImportForm = (typeof IMPORT_FORM)[keyof typeof IMPORT_FORM];

/**
 * Платформенные подкаталоги, в которых живут разделенные на платформы компоненты.
 */
export const PLATFORM_DIRS = ['desktop', 'mobile'] as const;
