module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/github',
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    branches: ['master', { name: 'beta', prerelease: true }],
    repositoryUrl: 'https://github.com/core-ds/arui-presets-lint.git',
};
