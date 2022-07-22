module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/github',
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    branches: ['master'],
    repositoryUrl: 'ssh://git@git.moscow.alfaintra.net/ef/arui-presets-lint.git',
};
