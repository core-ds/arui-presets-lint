const globalScriptsPattern = 'js,mjs,cjs,jsx,mjsx,ts,tsx,mts,cts,mtsx,ctsx';

export const GLOBAL_SCRIPTS_SCOPE = `**/*.{${globalScriptsPattern}}`;
export const NODEJS_SCRIPTS_SCOPE = `**/server/**/*.{${globalScriptsPattern}}`;
export const TYPESCRIPT_SCRIPTS_SCOPE = '**/*.{ts,tsx,mts,cts,mtsx,ctsx}';
export const REACT_SCRIPTS_SCOPE = '**/*.{jsx,mjsx,tsx,mtsx,ctsx}';
export const TESTS_SCRIPTS_SCOPE = `**/*.{test,tests,spec}.{${globalScriptsPattern}}`;
export const CYPRESS_SCOPE = `cypress/**/*.{${globalScriptsPattern}}`;
export const PLAYWRIGHT_SCOPE = `playwright/**/*.{${globalScriptsPattern}}`;
export const MARKDOWN_SCOPE = '**/*.md';
export const JSON_SCOPE = '**/*.{json,json5,jsonc}';
// Не должен пересекаться с остальными
export const ANOTHER_FILES_SCOPE =
    '**/*.{yaml,yml,css,jpeg,jpg,png,webp,gif,avif,heic,svg,ico,wasm,html,woff,woff2,ttf,otf,eot,graphql,gql}';
