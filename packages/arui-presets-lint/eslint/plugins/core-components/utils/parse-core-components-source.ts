import {
    CORE_COMPONENTS_PACKAGE,
    type CoreComponentsImportForm,
    STANDALONE_PREFIX,
} from '../constants/index.js';

type ParsedSource = {
    component: string;
    platform: string | null;
    importForm: CoreComponentsImportForm;
};

/**
 * Нормализует модуль-сегмент источника: обрезает файловое расширение и суффикс /index.
 */
const normalizeModulePath = (raw: string): string =>
    raw.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '').replace(/\/index$/, '');

/**
 * Разбирает источник на компонент, платформу и форму импорта.
 * Возвращает null для посторонних пакетов.
 */
export const parseCoreComponentsSource = (source: string): ParsedSource | null => {
    if (source === CORE_COMPONENTS_PACKAGE) {
        return { component: '', platform: null, importForm: 'aggregator' };
    }

    // Ветка отдельного подпакета: '@alfalab/core-components-<pkg>[/platform]'
    if (source.startsWith(STANDALONE_PREFIX)) {
        const [component, platform] = normalizeModulePath(
            source.slice(STANDALONE_PREFIX.length),
        ).split('/');

        return { component, platform: platform ?? null, importForm: 'standalone' };
    }

    const prefix = `${CORE_COMPONENTS_PACKAGE}/`;

    // Ветка агрегатора: '@alfalab/core-components/<pkg>[/platform]'
    if (!source.startsWith(prefix)) return null;

    const [component, platform] = normalizeModulePath(source.slice(prefix.length)).split('/');

    return { component, platform: platform ?? null, importForm: 'aggregator' };
};
