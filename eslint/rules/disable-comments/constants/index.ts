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
};

export const MESSAGE_IDS = {
    missingDescription: 'missingDescription',
    suggestDebug: 'suggestDebug',
};

export const MESSAGES = {
    [MESSAGE_IDS.missingDescription]:
        'Директива ESLint без описания. Добавьте описание после "--" чтобы объяснить причину использования.\n' +
        'Примеры:\n' +
        '  // eslint-disable-next-line правило -- причина отключения\n' +
        '  /* eslint-disable правило -- объяснение необходимости */\n' +
        '  /* eslint-env окружение -- описание контекста */',
    [MESSAGE_IDS.suggestDebug]: `Добавить комментарий "${SUGGESTS_DESCRIPTION.DEBUG}"`,
} as const;
