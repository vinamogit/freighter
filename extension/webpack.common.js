const CopyWebpackPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const { DEFAULT_STATS } = require("../config/webpack");

const BUILD_PATH = path.resolve(__dirname, "./build");

const commonConfig = (env = { EXPERIMENTAL: false }) => ({
  node: { global: true, fs: "empty" },
  entry: {
    background: [
      "babel-polyfill",
      path.resolve(__dirname, "./public/background.ts"),
    ],
    index: ["babel-polyfill", path.resolve(__dirname, "./src/popup/index.tsx")],
    contentScript: path.resolve(__dirname, "./public/contentScript.ts"),
  },
  watchOptions: {
    ignored: ["node_modules/**/*", "build/**/*"],
  },
  output: {
    path: BUILD_PATH,
    filename: (pathData) => {
      const name = pathData.chunk.name;
      /* don't add a hash to background and contentScript files 
      because manifest.json is hardcoded to look for background.min.js 
      and contentScript.min.js */
      return !name.includes("index")
        ? `${name.split("~")[0]}.min.js`
        : "[name].min.js";
    },
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, "./tsconfig.json"),
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
          },
        ],
      },
      {
        test: /\.(ts|tsx)$/,
        use: ["ts-loader"],
        exclude: /node-modules/,
      },
      {
        test: /\.png$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
          },
        ],
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              sourceMap: true,
            },
          },
          { loader: "sass-loader" },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "fonts/",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ESLintPlugin({
      extensions: [".ts", ".tsx"],
      failOnWarning: true,
    }),
    new CopyWebpackPlugin([
      { from: path.resolve(__dirname, "./public/static"), to: BUILD_PATH },
    ]),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, "./public/index.html"),
      chunks: ["index"],
      filename: `${BUILD_PATH}/index.html`,
    }),
    new webpack.DefinePlugin({
      EXPERIMENTAL: env.EXPERIMENTAL,
    }),
    new MiniCssExtractPlugin({
      filename: "style.min.css",
      chunkFilename: "[name].min.css",
    }),
  ],
  stats: DEFAULT_STATS,
  devServer: {
    stats: "minimal",
  },
});

module.exports.commonConfig = commonConfig;
module.exports.BUILD_PATH = BUILD_PATH;
