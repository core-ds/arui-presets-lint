export const GLOBAL_SCRIPTS_SCOPE = '**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mts,cts,mtsx,ctsx}';
export const NODEJS_SCRIPTS_SCOPE = '**/server/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}';
export const TYPESCRIPT_SCRIPTS_SCOPE = '**/*.{ts,tsx,mts,cts,mtsx,ctsx}';
export const REACT_SCRIPTS_SCOPE = '**/*.{jsx,mjsx,tsx,mtsx,ctsx}';
export const TESTS_SCRIPTS_SCOPE = '**/*.{test,tests,spec}.{js,jsx,ts,tsx,cjs,cts,mjs,mts}';
export const MARKDOWN_SCOPE = '**/*.md';
// Не должен пересекаться с остальными
export const ANOTHER_FILES_SCOPE =
    '**/*.{yaml,yml,css,jpeg,jpg,png,webp,gif,avif,heic,svg,ico,wasm,html,woff,woff2,ttf,otf,eot,graphql,gql}';
