module.exports = {
  // other configurations
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/ // Add this line
      },
    ],
  },
};
