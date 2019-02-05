const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm


const path = require('path');

const libraryName = 'application';
let outputFile;
let sourceMapType;

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        outputFile = `${libraryName}.js`;
        sourceMapType = 'source-map';
    } else if (argv.mode === 'development') {
        outputFile = `${libraryName}.js`;
        sourceMapType = 'inline-source-map';
    }

    return {
        entry: './src/application.js',
        mode: argv.mode,

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
                { test: /\.css$/, use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false,
                        }
                    }
                    ],
                }
            ]
        },

        plugins: [
            new HtmlWebpackPlugin({template: 'node_modules/qvv-map-library/src/index.html'})
        ],

        resolve: {
            alias: {
                node_modules: path.resolve(__dirname, './node_modules')
            },
            extensions: ['.js']
        },
        devtool: sourceMapType,

        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port: 9000
        }
    };
};
