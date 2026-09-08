import {
    CORE_COMPONENTS_PACKAGE,
    type CoreComponentsImportForm,
    IMPORT_FORM,
    STANDALONE_PREFIX,
} from '../constants/index.js';

type ParsedSource = {
    component: string;
    platform: string | null;
    importForm: CoreComponentsImportForm;
};

/**
 * Извлекает имя компонента и платформенный суффикс из модуля агрегатора
 * или из отдельного подпакета @alfalab/core-components-<pkg>.
 * Например:
 *   '@alfalab/core-components/button/desktop' -> { component: 'button', platform: 'desktop', form: 'aggregator' }
 *   '@alfalab/core-components-button/desktop' -> { component: 'button', platform: 'desktop', form: 'standalone' }
 */
export const parseCoreComponentsSource = (source: string): ParsedSource | null => {
    if (source === CORE_COMPONENTS_PACKAGE) {
        return { component: '', platform: null, importForm: IMPORT_FORM.AGGREGATOR };
    }

    // Ветка отдельного подпакета: '@alfalab/core-components-<pkg>[/platform]'
    if (source.startsWith(STANDALONE_PREFIX)) {
        const normalized = source
            .slice(STANDALONE_PREFIX.length)
            .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
            .replace(/\/index$/, '');
        const [component, platform] = normalized.split('/');

        return { component, platform: platform ?? null, importForm: IMPORT_FORM.STANDALONE };
    }

    const prefix = `${CORE_COMPONENTS_PACKAGE}/`;

    // Ветка агрегатора: '@alfalab/core-components/<pkg>[/platform]'
    if (!source.startsWith(prefix)) return null;

    const normalized = source
        .slice(prefix.length)
        .replace(/\.(js|jsx|ts|tsx|mjs|cjs)$/, '')
        .replace(/\/index$/, '');
    const [component, platform] = normalized.split('/');

    return { component, platform: platform ?? null, importForm: IMPORT_FORM.AGGREGATOR };
};
