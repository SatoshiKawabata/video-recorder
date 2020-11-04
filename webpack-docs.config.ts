import { Configuration } from "webpack";
import path from "path";
import CopyWebpackPlugin from "copy-webpack-plugin";

const config: Configuration = {
  entry: {
    index: "./src/index.tsx",
  },
  output: {
    // distディレクトリにcontent_scripts.jsを吐く
    path: path.join(__dirname, "docs"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /.ts|.tsx$/,
        use: "ts-loader",
        exclude: "/node_modules/",
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    // publicディレクトリにあるファイルをdocディレクトリにコピーする
    new CopyWebpackPlugin({
      patterns: [{ from: "public/index.html", to: "./index.html" }],
    }),
  ],
};

export default config;
