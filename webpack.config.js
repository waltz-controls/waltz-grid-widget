const path = require('path');
const webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AddAssetHtmlPlugin = require("add-asset-html-webpack-plugin");

module.exports = {
    mode: "production",
    entry: './test/main.js',
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.(tsx?)$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    // options: {
                    //     sourceMap: true
                    // }
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                include: /node_modules\/waltz_base/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }
                ]
            }
        ]
    },
    devtool: false,
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: "[file].map",
            exclude: ["vendor.js", "*@waltz-controls*"],
        }),
        new webpack.DllReferencePlugin({
            context: __dirname,
            manifest: require("waltz-base/dist/vendor-manifest.json"),
        }),
        new HtmlWebpackPlugin({
            minify: false,

        }),
        new AddAssetHtmlPlugin({
            filepath: path.resolve(__dirname, "node_modules/waltz-base/dist/vendor.js")
        }),

    ],
};