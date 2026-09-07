/**
 * Пакет-агрегатор design-системы core-components.
 * Импорты платформенных вариантов идут как @alfalab/core-components/<pkg>/desktop|mobile.
 */
export const CORE_COMPONENTS_PACKAGE = '@alfalab/core-components';

/**
 * Платформенные подкаталоги, в которых живут сплитнутые на платформы компоненты.
 */
export const PLATFORM_DIRS = ['desktop', 'mobile'] as const;
