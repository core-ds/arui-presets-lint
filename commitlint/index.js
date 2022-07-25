module.exports = {
    extends: '@commitlint/config-conventional',
    rules: {
        'scope-empty': [2, 'never'],
        'body-max-line-length': [2, 'always', 200],
    },
};
