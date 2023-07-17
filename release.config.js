module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        [
            '@semantic-release/release-notes-generator',
            {
                linkReferences: false,
                linkCompare: false,
            },
        ],
        '@semantic-release/changelog',
        '@semantic-release/github',
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    branches: ['master'],
    repositoryUrl: 'https://github.com/core-ds/arui-presets-lint.git',
};
