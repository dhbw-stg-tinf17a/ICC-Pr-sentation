const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const purgecss = require('@fullhuman/postcss-purgecss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = (env = {}) => ({
  mode: env.prod ? 'production' : 'development',
  devtool: env.prod ? 'source-map' : 'cheap-module-eval-source-map',
  entry: path.resolve(__dirname, './src/main.js'),
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/'
  },
  resolve: {
    alias: {
      'vue': '@vue/runtime-dom'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.png$/,
        use: {
          loader: 'url-loader',
          options: { limit: 8192 }
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !env.prod }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                tailwindcss,
                autoprefixer,
                purgecss({
                  content: ['./public/index.html', './src/**/*.vue'],
                  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
                }),
              ],
            },
          },
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  devServer: {
    hot: true,
    stats: 'minimal',
    contentBase: path.join(__dirname, 'public'),
    overlay: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
      },
    },
  }
});
