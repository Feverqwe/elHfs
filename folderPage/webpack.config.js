const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const Path = require('path');
const cssnano = require('cssnano');
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
        test: /\.(css|less)$/,
        loader: [
          {
            loader: MiniCssExtractPlugin.loader
          }, {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }, {
            loader: "less-loader",
            options: {
              sourceMap: true,
            },
          }
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name]-[contenthash].css',
      chunkFilename: '[contenthash].chunk.css',
    }),
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

if (!isProduction) {
  config.module.rules.push(
    {
      test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: Infinity,
        }
      }
    }
  );
} else {
  config.module.rules.push(
    {
      test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: Infinity,
        }
      }]
    },
  );
  config.plugins.push(
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: cssnano,
      cssProcessorPluginOptions: {
        preset: [
          'default',
          {discardComments: {removeAll: true}}
        ],
      },
      canPrint: true
    }),
  );
}

module.exports = config;