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
            register: './src/pages/register/register.js',
            registerMaster: './src/pages/register/master/register-master.js',
            registerCustomer: './src/pages/register/customer/register-customer.js',
            login: './src/pages/login/login.js',
            profile: './src/pages/profile/profile.js',
            createOrder: './src/pages/orders/create-order.js',
            myOrders: './src/pages/orders/my/my-orders.js',
            devices: './src/pages/devices/devices.js',
            addDevice: './src/pages/devices/add/add-device.js',
            firmwares: './src/pages/firmwares/firmwares.js',
            addFirmware: './src/pages/firmwares/add/add-firmware.js'
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
                    { from: /^\/register$/, to: '/register/index.html' },
                    { from: /^\/register\/master/, to: '/register/master/index.html' },
                    { from: /^\/register\/customer/, to: '/register/customer/index.html' },
                    { from: /^\/orders\/my/, to: '/orders/my/index.html' },
                    { from: /^\/orders/, to: '/orders/index.html' },
                    { from: /^\/devices\/add/, to: '/devices/add/index.html' },
                    { from: /^\/devices/, to: '/devices/index.html' },
                    { from: /./, to: '/index.html' },
                    { from: /\/login/, to: '/login/index.html'},
                    { from: /\/profile/, to: '/profile/index.html'},
                    { from: /\/firmwares/, to: '/firmwares/index.html'},
                    { from: /\firmwares\/add/, to: '/firmwares/add/index.html'}
                ]
            },
            proxy: [
                {
                    context: ['/api'],
                    target: 'http://localhost:8070',
                    secure: false,
                    changeOrigin: true
                }
            ],
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
            // Добавляем DefinePlugin для передачи переменных окружения
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
                'process.env.API_URL': JSON.stringify(isProduction ? '' : 'http://localhost:8070')
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
                template: './src/pages/register/index.html',
                filename: 'register/index.html',
                chunks: ['register'],
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
            new HtmlWebpackPlugin({
                template: './src/pages/login/index.html',
                filename: 'login/index.html',
                chunks: ['login'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/profile/index.html',
                filename: 'profile/index.html',
                chunks: ['profile'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/orders/index.html',
                filename: 'orders/index.html',
                chunks: ['createOrder'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/orders/my/index.html',
                filename: 'orders/my/index.html',
                chunks: ['myOrders'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/devices/index.html',
                filename: 'devices/index.html',
                chunks: ['devices'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/devices/add/index.html',
                filename: 'devices/add/index.html',
                chunks: ['addDevice'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/firmwares/index.html',
                filename: 'firmwares/index.html',
                chunks: ['firmwares'],
                inject: true
            }),
            new HtmlWebpackPlugin({
                template: './src/pages/firmwares/add/index.html',
                filename: 'firmwares/add/index.html',
                chunks: ['addFirmware'],
                inject: true
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'src/assets',
                        to: 'assets'
                    },
                    {
                        from: 'src/components/header',
                        to: 'components/header'
                    },
                    {
                        from: 'src/components',
                        to: 'components'
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