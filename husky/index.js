module.exports = {
    hooks: {
        'pre-commit': './node_modules/.bin/tsc --noEmit && yarn arui-presets-lint stage',
        'pre-push': 'yarn lint',
        'commit-msg': 'yarn arui-presets-lint commit -E HUSKY_GIT_PARAMS',
    },
};
