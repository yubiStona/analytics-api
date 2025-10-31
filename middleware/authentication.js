const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const token =
      req.headers?.authorization ||
      req.cookies?.Authorization ||
      req.body?.headers?.Authorization;    
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      next();
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Internal server error', error });
  }
};

module.exports = authenticateUser;
