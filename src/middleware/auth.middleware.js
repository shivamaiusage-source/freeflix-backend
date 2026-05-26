const jwt = require('jsonwebtoken');

// This middleware runs BEFORE protected route handlers
// It checks if the request has a valid JWT token
const authMiddleware = (req, res, next) => {

  // Get token from Authorization header
  // Header format: "Bearer eyJhbGciOiJIUzI1NiJ9..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Extract just the token part (remove "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // Verify token using our JWT_SECRET
    // If token is invalid or expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user data to request so route handlers can use it
    // e.g: req.user.id, req.user.email
    req.user = decoded;

    next(); // Move to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
