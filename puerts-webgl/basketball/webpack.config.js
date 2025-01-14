module.exports = {
    mode: 'development',
    entry: __dirname + "/output/entry.js",
    devtool: 'inline-source-map',
    output: {
        filename: 'behaviours.mjs',
        path: __dirname + '/../../Assets/Source/BasketballDemo/Resources',
        environment: { module: true },
        libraryTarget: 'module'
    },
    externalsType: "module",
    externals: {
        csharp: 'commonjs2 csharp',
        puerts: 'commonjs2 puerts',
    },
    experiments: {
        outputModule: true
    }
}