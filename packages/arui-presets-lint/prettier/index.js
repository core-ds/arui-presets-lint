/** @typedef {import('prettier').Config} PrettierConfig */

/** @type {PrettierConfig} */
export default {
    plugins: ['@prettier/plugin-oxc'],
    printWidth: 100,
    singleQuote: true,
    jsxSingleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    endOfLine: 'auto',
};
