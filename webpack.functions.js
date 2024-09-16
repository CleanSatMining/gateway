const path = require('path');

module.exports = {
  entry: './netlify/functions/server.js',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist/functions'),
    filename: 'server.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    'aws-sdk': 'aws-sdk' // Exclude AWS SDK from the bundle
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
};