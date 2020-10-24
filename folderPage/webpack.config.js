const HtmlWebpackPlugin = require('html-webpack-plugin');
const Path = require('path');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');

const outputPath = Path.join(__dirname, '../app/main/template/folder/');
const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

console.log('isProduction', isProduction);

const config = {
  entry: {
    index: './src/index',
  },
  output: {
    filename: '[name]-[contenthash].js',
    chunkFilename: '[contenthash].chunk.js',
    publicPath: '/assets/',
    path: Path.join(outputPath, 'assets'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ],
            presets: [
              '@babel/preset-react',
              ['@babel/preset-env', {
                targets: '> 5%',
              }]
            ]
          }
        }
      },
      {
        test: /\.(png)$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: Infinity,
          }
        }]
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: '../folder.html',
      template: './src/assets/folder.html',
      minify: {
        html5: true,
        removeComments: true,
        collapseWhitespace: true,
      },
      chunks: ['index']
    }),
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/index/]),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  }
};

module.exports = config;