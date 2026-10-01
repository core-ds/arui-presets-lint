import { describe, expect, it } from 'vitest';

import { parseCoreComponentsSource } from '../../eslint/plugins/core-components/utils/parse-core-components-source.js';

describe('parseCoreComponentsSource', () => {
    it('возвращает компонент без платформы для корня агрегатора с компонентом', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components/button')).toEqual({
            component: 'button',
            platform: null,
            importForm: 'aggregator',
        });
    });

    it('возвращает платформу для агрегатора с платформенным сегментом', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components/button/desktop')).toEqual({
            component: 'button',
            platform: 'desktop',
            importForm: 'aggregator',
        });
    });

    it('возвращает пустой компонент для корня агрегатора без компонента', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components')).toEqual({
            component: '',
            platform: null,
            importForm: 'aggregator',
        });
    });

    it('распознаёт отдельный подпакет без платформы', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components-button')).toEqual({
            component: 'button',
            platform: null,
            importForm: 'standalone',
        });
    });

    it('распознаёт отдельный подпакет с платформой', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components-button/mobile')).toEqual({
            component: 'button',
            platform: 'mobile',
            importForm: 'standalone',
        });
    });

    it('обрезает файловое расширение у агрегатора', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components/button/desktop.js')).toEqual({
            component: 'button',
            platform: 'desktop',
            importForm: 'aggregator',
        });
    });

    it('обрезает суффикс /index без расширения', () => {
        expect(parseCoreComponentsSource('@alfalab/core-components/button/index')).toEqual({
            component: 'button',
            platform: null,
            importForm: 'aggregator',
        });
    });

    it('распознаёт отдельный подпакет с расширением и суффиксом /index', () => {
        expect(
            parseCoreComponentsSource('@alfalab/core-components-button/desktop/index.ts'),
        ).toEqual({
            component: 'button',
            platform: 'desktop',
            importForm: 'standalone',
        });
    });

    it('возвращает null для постороннего пакета', () => {
        expect(parseCoreComponentsSource('some-lib')).toBeNull();
    });

    it('возвращает null для пакета с похожим, но другим префиксом', () => {
        expect(parseCoreComponentsSource('@alfalab/core-component/button')).toBeNull();
    });
});
