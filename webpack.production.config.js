let path = require('path');
let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let TerserPlugin = require('terser-webpack-plugin');
let WorkboxPlugin = require('workbox-webpack-plugin');


module.exports = {
  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, 'src/main.js')
    ],
    vendor: ['phaser', 'webfontloader']
  },
  mode: 'production',
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    filename: 'dist/bundle.js'
  },
  plugins: [
    new webpack.DefinePlugin({
      CANVAS_RENDERER: JSON.stringify(true),
      WEBGL_RENDERER: JSON.stringify(true)
    }),
    new CleanWebpackPlugin(['build']),
    new CopyWebpackPlugin([
      { from: 'assets', to: 'assets' },
      { from: 'src/manifest.json', to: './manifest.json' },
      { from: 'src/css', to: 'css' },
      { from: 'index.html', to: 'index.html' },
      { from: 'favicon.ico', to: 'favicon.ico' },
    ]),
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, 'build', 'index.html'),
      template: './src/index.html',
      chunks: ['vendor', 'app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: false,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      hash: true
    }),
    new WorkboxPlugin.GenerateSW({
      clientsClaim: true,
      skipWaiting: true
    })
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'], include: path.join(__dirname, 'src') },
    ]
  },
  optimization: {
    splitChunks: {
      name: 'vendor',
      chunks: 'all'
    },
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: false,
        },
      },
    })],
  }
}
