const path = require('path');

const libraryName = 'CancerVizualisation';
let outputFile;
let sourceMapType;

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        outputFile = `${libraryName}.min.js`;
        sourceMapType = 'source-map';
    } else if (argv.mode === 'development') {
        outputFile = `${libraryName}.js`;
        sourceMapType = 'inline-source-map';
    }

    return {
        entry: './src/CancerVizualisation.js',
        output: {
            filename: outputFile,
            library: libraryName,
            path: path.resolve(__dirname, 'dist'),
            libraryExport: 'default',
            libraryTarget: 'umd',
            umdNamedDefine: true
        },

        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    use: 'babel-loader',
                    exclude: /(node_modules|bower_components)/
                },

                {
                    test: /\.(c|d|t)sv$/, // load all .csv, .dsv, .tsv files with dsv-loader
                    use: ['dsv-loader?delimiter=,'] // or dsv-loader?delimiter=,
                }
            ]
        },

        resolve: {
            alias: {
                node_modules: path.resolve(__dirname, './node_modules')
            },
            extensions: ['.js']
        },
        devtool: sourceMapType
    };
};
