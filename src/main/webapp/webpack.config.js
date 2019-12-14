const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
    return {
        entry: './src/js/index.js',
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                },
                {
                    test: /\.(sass|scss)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader" // compiles Sass to CSS
                        }
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader" // creates style nodes from JS strings
                        },
                        {
                            loader: "css-loader" // translates CSS into CommonJS
                        }
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: '../fonts/'
                            }
                        }
                    ]
                },
                {
                    test: /\.(jpg|png|gif)$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: '../images/'
                            }
                        }
                    ]
                }
            ]
        },
        watch: argv.mode === 'development',
        watchOptions: {
            ignored: /node_modules/
        },
        devtool: argv.mode === 'development' ? 'source-map' : 'none',
        plugins: [
            new CopyPlugin([
                { from: 'node_modules/mxgraph/javascript/src/css/*.css', to: 'mxgraph/css/', flatten: true },
                { from: 'node_modules/mxgraph/javascript/src/images/*.gif', to: 'mxgraph/images/', flatten: true },
                { from: 'node_modules/mxgraph/javascript/src/resources/*.txt', to: 'mxgraph/resources/', flatten: true },
            ])
        ]
    }
};