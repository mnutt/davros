const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './app.js',
  output: {
    filename: 'app.js',
    sourceMapFilename: 'app.js.map',
    path: path.resolve(__dirname, 'output')
  },
  node: {
    global: false,
    __filename: false,
    __dirname: false
  },
  target: 'node',
  devtool: 'cheap-module-source-map',
  externals: [
    {
      'node-ssh': 'commonjs node-ssh',
      'spawn-sync': 'commonjs spawn-sync',
      sharp: 'commonjs sharp'
      //formidable: 'commonjs formidable'
    }
  ],
  optimization: {
    minimize: false
  },
  plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false })],
  module: {
    wrappedContextRegExp: /$^/,
    wrappedContextCritical: false,
    noParse: /\.(ico|png)/,
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader'
      }
    ]
  }
};
