export type CoreComponentsImportRuleOptions = {
    /**
     * Список сплитнутых на платформы компонентов core-components
     * (имена подкаталогов, например 'button').
     * Если не передан, правило само определяет их по установленной
     * в node_modules версии @alfalab/core-components в момент запуска.
     */
    splitComponents?: string[];
};

export type CoreComponentsImportFinding = {
    component: string;
    file: string;
    line: number;
    importPath: string;
};
