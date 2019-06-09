var webpack = require("webpack");
var path = require("path");
const glob = require('glob')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var inProduction = process.env.NODE_ENV === "production";
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');


const PATHS = {
  src: path.join(__dirname, 'src')
}

module.exports = {
  optimization: {
    minimizer: [],
  },

  mode: "development",

  entry: {
    app: [
      "./src/main.js",
      "./src/main.scss"
    ],
    vendor: ["jquery"]
  },

  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].[chunkhash].js"
  },

  module: {
    rules: [
      // 

      //? CSS
      // CSS FILES CAN BE REFERENCED FROM YOUR MAIN.JS FILE WITH CSS-LOADER
      // && 
      // STYLE-LOADER APPLIES STYLES TO YOUR HTML.
      // &&
      // SASS-LOADER WILL COMPILE SASS FILES.
      {
        test: /\.s[ac]ss$/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: process.env.NODE_ENV === "development",
              reloadAll: true
            },
          },
          "css-loader",
          "sass-loader",
        ]
      },

      //? FONTS
      {
        test: /\.(svg|eot|ttf|woff|woff2)$/,
        use: "file-loader"
      },

      //? IMAGES/URL
      // READS URLS IN CSS FILES AND RELATES THEM CORRECTLY
      // WHEN COMPILYING.
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
            loader: "file-loader",
            options: {
              // name: "[path]/[name].[ext]"
              name: "images/[name].[ext]"
            }
          },
          "image-webpack-loader"
        ]
      },

      //? JS
      // JAVASCRIPT ES6 LOADER (babel-loader).
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },

  plugins: [
    // EXTRACT CSS FILES INTO DIST DIR.
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),

    // MINIMIZE OPTIONS/ when in production css will be minimized.
    new webpack.LoaderOptionsPlugin({
      minimize: inProduction,
      debug: false,
    }),

    // REMOVE UNUSED CSS.
    // new PurgecssPlugin({
    //   paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
    // }),

    // REMOVE UNUSED FILES.
    new CleanWebpackPlugin({
      verbose: true
    }),

    // OWN PLUGIN.
    function() {
      this.plugin("done", stats => {
        require("fs").writeFileSync(
          path.join(__dirname, "dist/manifest.json"),
          JSON.stringify(stats.toJson().assetsByChunkName)
        )
      })
    },

    // GRABS THE JS/CSS HASHED FILES AN CREATES A NEW
    //  HTML FILE WITH THE GENERATED HASHED FILES
    // OUTPUTS TO SPECIFIED PATH UP ABOVE
    new HtmlWebpackPlugin({
      template: "index.html"
    })
  ]
};

// MINIFY JAVASCRIPT CODE ONLY IF IN "PRODUCTION":
if (inProduction) {
  module.exports.optimization.minimizer.push(
    new UglifyJsPlugin({
      test: /\.js(\?.*)?$/i,
    })
  )
}