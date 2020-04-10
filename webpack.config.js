const path = require('path')

// Plugins
const HtmlWebpackPlugin = require('html-webpack-plugin'), 
      HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin'),
      MiniCssExtractPlugin = require('mini-css-extract-plugin'),
      WebpackMessages = require('webpack-messages'),
      CopyPlugin = require('copy-webpack-plugin');


console.clear()

module.exports = (env, argv) => {
  return {
    mode: (argv.mode === 'production') ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: (argv.mode === 'production') ? false : 'inline-source-map',

    stats: false,

    entry: {
      main: './src/main.entry.ts',
      ui: './src/ui.entry.js',
    },

    output: {
      filename: '[name].js',
      path: path.join(__dirname, 'build'),
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
          test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          use: 'base64-inline-loader?limit=100000&name=[name].[ext]'
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
      new WebpackMessages(),
  
      // added by me
      new CopyPlugin([
        { 
          from: './src/manifest.json', 
          to: './manifest.json',
          transform: (content, path) => {
            try {
              const str = content.toString().replace('__STATE__', (argv.mode === 'production' ? '🚀 PROD' : '⚙️ DEV'))
              return Buffer.from(str)
            } catch (error) {
              console.error(error)
            }
          }
        },
      ])
    ],  
  }
}
