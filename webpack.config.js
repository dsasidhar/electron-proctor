// webpack.config.js
const path = require("path");
const webpack = require("webpack");
const WebpackObfuscator = require("webpack-obfuscator");
const fs = require("fs");

// Only used in production build
const htmlContent = fs.readFileSync("./index.html", "utf8");

module.exports = {
  entry: "./main.js",
  target: "electron-main",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "proctoring-tool.js",
  },
  plugins: [
    new webpack.DefinePlugin({
      INLINE_HTML: JSON.stringify(htmlContent),
      IS_PROD: true,
    }),
    new WebpackObfuscator({
      rotateStringArray: true,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.4,
      identifierNamesGenerator: "hexadecimal",
    }),
  ],
  node: {
    __dirname: false,
    __filename: false,
  },
};
