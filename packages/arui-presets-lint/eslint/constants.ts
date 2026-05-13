const scriptsExtentionsPattern = '{js,mjs,cjs,jsx,mjsx,ts,tsx,mts,cts,mtsx,ctsx}';

export const GLOBAL_SCRIPTS_SCOPE = `**/*.${scriptsExtentionsPattern}`;
export const NODEJS_SCRIPTS_SCOPE = `**/server/**/*.${scriptsExtentionsPattern}`;
export const TYPESCRIPT_SCRIPTS_SCOPE = '**/*.{ts,tsx,mts,cts,mtsx,ctsx}';
export const REACT_SCRIPTS_SCOPE = '**/*.{jsx,mjsx,tsx,mtsx,ctsx}';
export const TESTS_SCRIPTS_SCOPE = `**/*.{test,tests,spec}.${scriptsExtentionsPattern}`;
export const CYPRESS_SCOPE = `cypress/**/*.${scriptsExtentionsPattern}`;
export const PLAYWRIGHT_SCOPE = `playwright/**/*.${scriptsExtentionsPattern}`;
export const MARKDOWN_SCOPE = '**/*.md';
export const JSON_SCOPE = '**/*.{json,json5,jsonc}';
// Не должен пересекаться с остальными
export const ANOTHER_FILES_SCOPE =
    '**/*.{yaml,yml,css,jpeg,jpg,png,webp,gif,avif,heic,svg,ico,wasm,html,woff,woff2,ttf,otf,eot,graphql,gql}';
