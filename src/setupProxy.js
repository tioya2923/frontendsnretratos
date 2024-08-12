const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://backend-family-c1c363294a5e.herokuapp.com',
      changeOrigin: true,
    })
  );
};
