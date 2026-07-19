/** @typedef {import('prettier').Config} PrettierConfig */

/**
 * Описание опций тут:
 * https://prettier.io/docs/options
 *
 * @type {PrettierConfig}
 */
export default {
    // https://www.npmjs.com/package/@prettier/plugin-oxc
    plugins: ['@prettier/plugin-oxc'],
    printWidth: 100,
    singleQuote: true,
    jsxSingleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    endOfLine: 'auto',
};
