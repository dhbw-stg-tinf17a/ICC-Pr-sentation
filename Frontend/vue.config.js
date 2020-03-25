module.exports = {
  devServer: {
    port: 3001,
    proxy: {
      '^/api': {
        target: 'https://gunter.felixsz.de',
      },
    },
  },
};
