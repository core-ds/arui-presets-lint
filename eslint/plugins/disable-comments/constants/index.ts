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
    invalidDescription: 'invalidDescription',
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
    [MESSAGE_IDS.invalidDescription]:
        'Описание слишком общее или неинформативное. Укажите конкретную причину.',
    [MESSAGE_IDS.suggestDebug]: `Добавить комментарий "${SUGGESTS_DESCRIPTION.DEBUG}"`,
    [MESSAGE_IDS.suggestAboveComment]: `Добавить задачу (TODO) на исправление "${SUGGESTS_DESCRIPTION.ABOVE_COMMENT}"`,
} as const;

export const DESCRIPTION_SEPARATOR: RegExp = /\s-{2,}\s/u; // Регулярное выражение для разделения директивы и описания

export const DESCRIPTION_REPLACEMENT: RegExp = /\s-{2,}.*$/u; // Регулярное выражение для удаления существующего описания

export const MIN_DESCRIPTION_LENGTH = 5; // мин. длина комментария

export const FORBIDDEN_PATTERNS = [
    /^\s*$/u, // пустые строки
    /^[\\s\\p{Punct}]*$/u, // только пробелы и пунктуация
];

export const MEANINGFUL_PATTERNS = [
    /[a-zA-Zа-яА-Я]{2,}/u, // содержит слова из 2+ букв
    /\\d+/u, // содержит числа (возможно, номера задач)
];
