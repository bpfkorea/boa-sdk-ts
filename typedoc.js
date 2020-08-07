module.exports = {
    out: './docs/',
    readme: './README.MD',
    includes: './src',
    exclude: [
        '**/node_modules/**/*',
        '**/lib/**/*',
        '**/dist/**/*',
        '**/tests/**/*',
        '**/@types/**/*',
    ],
    mode: 'file',
    excludeExternals: true,
    excludePrivate: true,
    includeDeclarations: true,
    stripInternal: true,
    hideGenerator: true,
    theme: 'minimal'
};
