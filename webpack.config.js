'use strict';
const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');

const env = process.env.NODE_ENV;
const isDev = env !== 'production';

const cssLoaderConfig = {
    loader: 'css-loader',
    query: {
        modules: true,
        camelCase: true,
        localIdentName: isDev ? '[name]-[local]' : '[name]-[local]-[hash:base64:5]'
    }
};

const devStylesLoader = [
    'style-loader',
    cssLoaderConfig,
    'stylus-loader'
];

const prodStylesLoader = ExtractTextPlugin.extract({
    use: [
        cssLoaderConfig,
        'stylus-loader'
    ]
});

module.exports = {
    entry: ((isDev) => {
        if (isDev) {
            return [
                'webpack-dev-server/client',
                'webpack/hot/only-dev-server',
                './app/app.dev.js',
            ];
        }

        return ['./app/app.prod.js'];
    })(isDev),
    output: {
        filename: isDev ? '[name].bundle.js' : '[name].[hash].js',
        path: path.join(__dirname, 'public'),
        publicPath: '/',
        hotUpdateChunkFilename: '[id].[hash].hot-update.js',
        hotUpdateMainFilename: '[hash].hot-update.json',
    },
    module: {
        rules: [
            {
                test: /.jsx?/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: [
                        'react'
                    ],
                    plugins: [
                        'transform-class-properties',
                        'transform-object-rest-spread'
                    ]
                }
            },
            {
                test: /\.styl/,
                loaders: isDev ? devStylesLoader : prodStylesLoader
            }
        ]
    },
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js', '.json', '.jsx']
    },
    watch: isDev,
    devtool: isDev ? 'source-map' : false,
    plugins: ((isDev) => {
        const sharedPlugins = [
            new webpack.EnvironmentPlugin(['NODE_ENV']),
        ];

        if (isDev) {
            return [
                ...sharedPlugins,

                new webpack.HotModuleReplacementPlugin(),
                new webpack.NamedModulesPlugin(),
            ];
        }

        return [
            ...sharedPlugins,

            new webpack.optimize.UglifyJsPlugin(),
            new ExtractTextPlugin({ filename: '[name].[contenthash].css', allChunks: true }),
            new AssetsPlugin({ filename: 'assets.json' })
        ];
    })(isDev),
    devServer: {
        contentBase: [path.join(__dirname, 'public')],
        quiet: false,
        stats: {
            errors: true,
            colors: true,
        },
        compress: true,
        hot: isDev,
        port: 9000
    }
};
