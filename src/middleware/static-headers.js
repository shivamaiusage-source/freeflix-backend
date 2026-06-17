module.exports = function staticHeaders(req, res, next) {
  if (req.path === '/recorder.js') {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/javascript');
  }
  next();
};
