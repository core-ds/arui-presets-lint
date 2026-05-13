import markdown from '@eslint/markdown';
import { type Linter } from 'eslint';

import { MARKDOWN_SCOPE } from '../constants.js';

export const markdownConfig: Linter.Config = {
    name: 'arui-presets-lint/markdown',
    files: [MARKDOWN_SCOPE],
    // CHANGELOG.md обычно генерируется автоматически (например, changesets/lerna)
    // и не соответствует строгим правилам CommonMark
    ignores: ['**/CHANGELOG.md'],
    plugins: {
        markdown,
    } as unknown as Linter.Config['plugins'],
    language: 'markdown/commonmark',
    rules: {
        // Требует указывать язык для блоков кода с тройными бэктиками
        // https://github.com/eslint/markdown/blob/main/docs/rules/fenced-code-language.md
        'markdown/fenced-code-language': 'warn',

        // Уровни заголовков должны увеличиваться строго на единицу
        // https://github.com/eslint/markdown/blob/main/docs/rules/heading-increment.md
        'markdown/heading-increment': 'warn',

        // Запрещает дублирование definitions для ссылок и изображений
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-duplicate-definitions.md
        'markdown/no-duplicate-definitions': 'warn',

        // Запрещает definitions без URL
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-definitions.md
        'markdown/no-empty-definitions': 'warn',

        // Запрещает изображения с пустым src
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-images.md
        'markdown/no-empty-images': 'warn',

        // Запрещает ссылки с пустым URL
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-empty-links.md
        'markdown/no-empty-links': 'warn',

        // Запрещает невалидный синтаксис меток-ссылок
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-invalid-label-refs.md
        'markdown/no-invalid-label-refs': 'warn',

        // Требует пробел после решёток в ATX-заголовках (# Заголовок, а не #Заголовок)
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-atx-heading-space.md
        'markdown/no-missing-atx-heading-space': 'warn',

        // Запрещает ссылаться на несуществующие метки
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-label-refs.md
        'markdown/no-missing-label-refs': 'warn',

        // Запрещает ссылки на несуществующие якоря/заголовки в текущем документе
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-missing-link-fragments.md
        'markdown/no-missing-link-fragments': 'warn',

        // Запрещает несколько H1 в одном документе
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-multiple-h1.md
        'markdown/no-multiple-h1': 'warn',

        // Запрещает URL, по форме совпадающие с reference-метками
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-reference-like-urls.md
        'markdown/no-reference-like-urls': 'warn',

        // Запрещает перевёрнутый синтаксис ссылок/изображений ((text)[url] вместо [text](url))
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-reversed-media-syntax.md
        'markdown/no-reversed-media-syntax': 'warn',

        // Запрещает пробелы вокруг маркеров выделения (* _)
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-space-in-emphasis.md
        'markdown/no-space-in-emphasis': 'warn',

        // Запрещает неиспользуемые definitions
        // https://github.com/eslint/markdown/blob/main/docs/rules/no-unused-definitions.md
        'markdown/no-unused-definitions': 'warn',

        // Требует alt-текст для изображений
        // https://github.com/eslint/markdown/blob/main/docs/rules/require-alt-text.md
        'markdown/require-alt-text': 'warn',

        // Количество ячеек в строке таблицы должно совпадать с количеством колонок в заголовке
        // https://github.com/eslint/markdown/blob/main/docs/rules/table-column-count.md
        'markdown/table-column-count': 'warn',
    },
};
