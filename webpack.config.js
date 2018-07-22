const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BASE_DIR = __dirname;
const ENV = process.env.NODE_ENV;

module.exports = {
    entry: {
        app: path.join(BASE_DIR, 'src', 'client.tsx'),
    },
    resolve: {
        alias: {
            basedir: path.resolve(BASE_DIR)
        },
        extensions: ['.js', '.ts', '.tsx', '.css', '.less']
    },
    output: {
        path: path.resolve(BASE_DIR, './dist'),
        publicPath: '/',
        filename: '[name].bundle.js',
        chunkFilename: '[id].chunk.js'
    },
    module: {
        rules: [
            // { test: /\.(html|txt)/, use: 'raw' },
            // { test: /\.json$/, use: 'json' },
            // { test: /\.(woff|woff2|eot|ttf)$/, use: 'url-loader?limit=100000', exclude: /https/ },
            {
              test: /\.tsx?$/,
              loader: 'ts-loader',
              options: {
                  onlyCompileBundledFiles: true,
                  logLevel: 'error',
              }
            },
            {
                test: /\.(png|jpg|jpeg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'assets/[name].[ext]',
                            exclude: /https/
                        },
                    },
                ]
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(true),
          ENV: JSON.stringify(ENV),
        }),
        new HtmlWebpackPlugin({
            template: 'src/template.html'
        }),
    ]
};