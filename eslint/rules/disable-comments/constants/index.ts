// Поддерживаемые типы ESLint директив
export const SUPPORTED_DIRECTIVES = [
    'eslint',
    'eslint-disable',
    'eslint-disable-line',
    'eslint-disable-next-line',
    'eslint-enable',
    'eslint-env',
] as const;

/**
 * Коллекция описаний для автодополнений в правилах ESLint.
 * Используется для предоставления пользователю готовых вариантов описаний при нарушении правила
 */
export const SUGGESTS_DESCRIPTION = {
    DEBUG: 'Используется временно для отладки',
    ABOVE_COMMENT: 'TODO: [https://jira.moscow.alfaintra.net/browse/{TASK}] Описание',
};

export const MESSAGE_IDS = {
    missingDescription: 'missingDescription',
    suggestDebug: 'suggestDebug',
    suggestAboveComment: 'suggestAboveComment',
};

export const MESSAGES = {
    [MESSAGE_IDS.missingDescription]:
        'Директива ESLint без описания. Добавьте описание после "--" или комментарий над директивой чтобы объяснить причину использования.\n' +
        '\nПримеры:\n' +
        '1. // eslint-disable-next-line правило -- причина отключения\n' +
        '2. /* eslint-disable правило -- объяснение необходимости */\n' +
        '3. /* eslint-env окружение -- описание контекста */\n' +
        '4. // причина отключения правила\n' +
        '   // eslint-disable-next-line правило\n' +
        '5. /*\n' +
        '   * Развернутое объяснение\n' +
        '   * и причины отключения\n' +
        '   */\n' +
        '   // eslint-disable-next-line правило',
    [MESSAGE_IDS.suggestDebug]: `Добавить комментарий "${SUGGESTS_DESCRIPTION.DEBUG}"`,
    [MESSAGE_IDS.suggestAboveComment]: `Добавить задачу (TODO) на исправление "${SUGGESTS_DESCRIPTION.ABOVE_COMMENT}"`,
} as const;
