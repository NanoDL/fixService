const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    return {
        devtool: 'source-map',
        mode: isProduction ? 'production' : 'development',
        entry: {
            main: './src/index.js',
            masters: './src/pages/masters/masters.js',
            registerMaster: './src/pages/register/master/register-master.js',
            registerCustomer: './src/pages/register/customer/register-customer.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].bundle.js',
            publicPath: '/',
            clean: true
        },
        devServer: {
            static: {
                directory: path.join(__dirname, 'dist'),
            },
            port: 3000,
            hot: true,
            historyApiFallback: {
                rewrites: [
                    { from: /^\/masters/, to: '/masters/index.html' },
                    { from: /^\/register\/master/, to: '/register/master/index.html' },
                    { from: /^\/register\/customer/, to: '/register/customer/index.html' },
                    { from: /./, to: '/index.html' }
                ]
            },
            open: true
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader'
                    ],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                sassOptions: {
                                    quietDeps: true
                                }
                            }
                        }
                    ],
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[name][ext]'
                    }
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[name][ext]'
                    }
                },
            ],
        },
        plugins: [
            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                'window.$': 'jquery',
            }),
            new MiniCssExtractPlugin({
                filename: isProduction ? 'styles/[name].[contenthash].css' : 'styles/[name].css',
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/index.html',
                filename: 'index.html',
                chunks: ['main'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/masters/index.html',
                filename: 'masters/index.html',
                chunks: ['masters'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/register/master/index.html',
                filename: 'register/master/index.html',
                chunks: ['registerMaster'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/register/customer/index.html',
                filename: 'register/customer/index.html',
                chunks: ['registerCustomer'],
                inject: true
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'src/assets',
                        to: 'assets'
                    }
                ],
            }),
        ],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@styles': path.resolve(__dirname, 'src/styles'),
                '@scripts': path.resolve(__dirname, 'src/scripts'),
                '@components': path.resolve(__dirname, 'src/components'),
                '@assets': path.resolve(__dirname, 'src/assets')
            }
        }
    };
};