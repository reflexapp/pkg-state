module.exports = {
    entry: "./src/app.js",
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,

        }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        filename: './app.js',
        libraryTarget: 'umd',
        library: 'sand',
    }
}
