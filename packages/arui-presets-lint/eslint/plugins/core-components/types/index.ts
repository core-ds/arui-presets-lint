export type CoreComponentsImportRuleOptions = {
    /**
     * Ручной список сплит-компонентов (имена компонентов core-components,
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
