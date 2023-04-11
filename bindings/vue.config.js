module.exports = {
  pages: {
    index: {
      // entry for the page
      entry: process.env.NODE_ENV == "development" ? 'src/dev.js' : 'src/main.js'
    },
  },
  devServer: {
    disableHostCheck: true
  }
}