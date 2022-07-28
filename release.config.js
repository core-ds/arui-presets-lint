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
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    branches: ['master'],
};
