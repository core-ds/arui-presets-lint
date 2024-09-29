export default {
    '*.{js,jsx,ts,tsx}': ['prettier --write', 'eslint'],
    '*.css': ['prettier --write', 'stylelint'],
    '*.json': ['prettier --write'],
};
