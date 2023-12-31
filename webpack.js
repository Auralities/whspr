// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const autoprefixer = require('autoprefixer');
const isProduction = process.env.NODE_ENV == 'production';


module.exports = {
    entry: './client/src/index.tsx',
    mode: isProduction ? 'production' : 'development',
    output: {
        path: path.resolve(__dirname, './client/dist'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    devServer: {
        open: true,
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './client/src/index.html',
            filename: './index.html'
        }),

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    resolve: {
        extensions: ['.ts', '.tsx']
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
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
        ],
    },
};

if (isProduction) {
  module.exports.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
}