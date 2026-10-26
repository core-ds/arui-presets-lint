import {
    CORE_COMPONENTS_PACKAGE,
    type CoreComponentsImportForm,
    PLATFORM_DIRS,
    STANDALONE_PREFIX,
} from '../constants/index.js';

type ParsedSource = {
    component: string;
    platform: string | null;
    importForm: CoreComponentsImportForm;
};

/**
 * Является ли сегмент пути платформенным подкаталогом (desktop/mobile).
 */
const isPlatform = (segment: string | undefined): segment is string =>
    segment !== undefined && (PLATFORM_DIRS as readonly string[]).includes(segment);

/**
 * Нормализует модуль-сегмент источника: обрезает файловое расширение и суффикс /index.
 */
const normalizeModulePath = (raw: string): string =>
    raw.replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '').replace(/\/index$/, '');

/**
 * Разбирает источник на компонент, платформу и форму импорта.
 * `platform` заполняется только для реальных платформенных подкаталогов.
 * Возвращает null для посторонних пакетов.
 */
export const parseCoreComponentsSource = (source: string): ParsedSource | null => {
    if (source === CORE_COMPONENTS_PACKAGE) {
        return { component: '', platform: null, importForm: 'aggregator' };
    }

    // Ветка отдельного подпакета: '@alfalab/core-components-<pkg>[/<segment>]'
    if (source.startsWith(STANDALONE_PREFIX)) {
        const [component, segment] = normalizeModulePath(
            source.slice(STANDALONE_PREFIX.length),
        ).split('/');

        return {
            component,
            platform: isPlatform(segment) ? segment : null,
            importForm: 'standalone',
        };
    }

    const prefix = `${CORE_COMPONENTS_PACKAGE}/`;

    // Ветка агрегатора: '@alfalab/core-components/<pkg>[/<segment>]'
    if (!source.startsWith(prefix)) {
        return null;
    }

    const [component, segment] = normalizeModulePath(source.slice(prefix.length)).split('/');

    return { component, platform: isPlatform(segment) ? segment : null, importForm: 'aggregator' };
};
