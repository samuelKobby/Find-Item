const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const TokenBlacklist = require('../models/TokenBlacklist');

// Password validation
const isPasswordValid = (password) => {
  return password.length >= 8 && // at least 8 characters
         /[A-Z]/.test(password) && // at least one uppercase
         /[a-z]/.test(password) && // at least one lowercase
         /[0-9]/.test(password) && // at least one number
         /[^A-Za-z0-9]/.test(password); // at least one special character
};

// Register a new admin
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Validate password strength
    if (!isPasswordValid(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
      });
    }

    // Check if the admin already exists
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    // Create a new admin
    admin = new Admin({
      username,
      password: bcrypt.hashSync(password, 10), // hash password
    });

    // Save the admin to the database
    await admin.save();

    // Generate JWT token
    const payload = {
      admin: {
        id: admin.id,
        username: admin.username
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          success: true,
          token,
          admin: {
            id: admin.id,
            username: admin.username
          }
        });
      }
    );
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      admin: {
        id: admin.id,
        username: admin.username
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          success: true,
          token,
          admin: {
            id: admin.id,
            username: admin.username
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  try {
    // If we reach here, it means the token is valid (thanks to protect middleware)
    // Return the user information
    res.json({
      success: true,
      admin: {
        id: req.admin.id,
        username: req.admin.username
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Logout admin
exports.logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Add token to blacklist
    const blacklistedToken = new TokenBlacklist({
      token,
      expiresAt: new Date(Date.now() + 3600000) // 1 hour from now
    });

    await blacklistedToken.save();
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ error: 'Server error during logout' });
  }
};
