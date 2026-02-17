const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // Existing proxy configuration
    createProxyMiddleware({
      target: 'https://snrefeicoes.pt/',
      changeOrigin: true,
    })
  );
  app.use(
    '/backend-sn',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};
