const process = require('process');
const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// added by me
const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
  mode: (process.env.NODE_ENV === 'production') ? 'production' : 'development',
  // force not using 'eval' which doesn't recognize __html__ and other globals
  devtool: (process.env.NODE_ENV === 'production') ? '' : 'inline-source-map',
  entry: {
    main: './src/main.entry.ts',
    ui: './src/ui.entry.js',
  },
  stats: 'errors-only',
  output: {
    filename: '[name].js',
    path: path.join(process.cwd(), './dist'),
  },
  module: {
    rules: [
      // JS and TS
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
        ]
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'ts-loader'
        ]
      },
      // CSS and SCSS
      {
        test: /\.s?css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: 'base64-inline-loader'
      }
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.scss', '.html',],
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[name].css'}),
    new HtmlWebpackPlugin({
      filename: 'ui.html',
      template: './src/ui.html',
      inlineSource: '.(js|css)$',
      chunks: ['ui'],
    }),
    new HtmlWebpackInlineSourcePlugin(),

    // added by me
    new CopyPlugin([
      { from: './src/manifest.json', to: './manifest.json' },
    ])
  ],  
};
