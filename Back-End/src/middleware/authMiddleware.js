const jwt = require('jsonwebtoken');
const Admin = require('../models/admin'); 
const TokenBlacklist = require('../models/TokenBlacklist'); 

exports.protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token:', token);

      // Check if the token is blacklisted
      const blacklistedToken = await TokenBlacklist.findOne({ token });
      if (blacklistedToken) {
        return res.status(401).json({ error: 'Not authorized, token is blacklisted' });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded:', decoded);

      // Find the admin associated with the token and attach it to the request object
      req.admin = await Admin.findById(decoded.admin.id).select('-password');

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Handle token verification errors
      res.status(401).json({ error: 'Not authorized, token failed' });
    }
  } else {
    // Handle the case where no token is provided
    res.status(401).json({ error: 'Not authorized, no token' });
  }
};
