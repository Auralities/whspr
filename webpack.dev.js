// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const autoprefixer = require('autoprefixer');
const isProduction = process.env.NODE_ENV == 'production';
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';


const config = {
    entry: './client/src/index.tsx',
    mode:'development',
    watch: true,
    output: {
        path: path.resolve(__dirname, './client/dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        open: true,
        host: 'localhost',
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './client/src/index.html',
            filename: './index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        alias: {
          '@common': path.resolve(__dirname, 'src/common'),
          'wavesurfer.js/dist/plugins/*': ['node_modules/wavesurfer.js/dist/plugins/*']
        }
    },
    module: {
        rules: [
            {
              test: /\.(ts|tsx)$/,
              use: [
                {
                  loader: 'babel-loader', // Use babel-loader for transpiling TypeScript code
                  options: {
                    presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
                  },
                },
                {
                  loader: 'ts-loader', // Use ts-loader for TypeScript files
                  options: {
                    transpileOnly: true, //skips type checking - faster compilation
                  },
                },
              ],
            },
            {
              test: /\.(js|jsx)$/,
              use: {
                loader: 'babel-loader',
              },
              test: /\.css$/i,
              use: [stylesHandler, 'css-loader'],

            },
              {
                test: /\.(scss)$/,
                use: [
                  {
                    // Adds CSS to the DOM by injecting a `<style>` tag
                    loader: 'style-loader',
                  },
                  {
                    // Interprets `@import` and `url()` like `import/require()` and will resolve them
                    loader: 'css-loader',
                  },
                  {
                    // Loader for webpack to process CSS with PostCSS
                    loader: 'postcss-loader',
                    options: {
                      postcssOptions: {
                        plugins: [
                          autoprefixer,
                        ],
                      },
                    },
                  },
                  {
                    // Loads a SASS/SCSS file and compiles it to CSS
                    loader: 'sass-loader',
                  },
                ],
              },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i, //may need to include mp3/sound? 
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
        
        
        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
        config.plugins.push(new MiniCssExtractPlugin());
        
    } else {
        config.mode = 'development';
    }
    return config;
};
