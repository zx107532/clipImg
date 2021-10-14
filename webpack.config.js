const path = require('path')
const pkg = require('./package.json');

module.exports = {
  entry: ['./src/index.ts'],
  experiments: {
    outputModule: false
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index.js',
    clean: true,
    libraryTarget: 'umd', //设置 library 规范
    globalObject: 'this', //设置全局环境
    library: pkg.title, //设置库名
    // umdNamedDefine: true //umd 规范中输出 amd 的命名
    // enabledChunkLoadingTypes: ['jsonp', 'require'],
    // enabledLibraryTypes: ['module'],
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.resolve(__dirname, './tsconfig.json')
            }
          },
          // 'babel-loader'
        ],
        exclude: /node-modules/,
      }
      // {
      //   test: /\.ts$/,
      //   exclude: /node-modules/,
      //   loader: "babel-loader",
      // }
    ]
  }
}
