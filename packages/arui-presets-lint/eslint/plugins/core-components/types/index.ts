import { type PLATFORM_DIRS } from '../constants/index.js';

/** Имя платформы, ограниченное объявленными PLATFORM_DIRS. */
export type PlatformName = (typeof PLATFORM_DIRS)[number];

export type CoreComponentsImportRuleOptions = {
    /**
     * Ручной список компонентов разделенных на платформы (имена компонентов core-components,
     * например 'button'). Полностью заменяет автоопределение по установленной
     * в node_modules версии @alfalab/core-components. Если не передан,
     * список определяется автоматически в момент запуска.
     */
    splitComponents?: string[];
    /**
     * Компоненты, которые нужно исключить из проверки (имена компонентов
     * core-components, например 'button', 'alert'). Вычитается из итогового
     * набора: как из переданного splitComponents, так и из автоопределения.
     */
    excludeSplitComponents?: string[];
};
