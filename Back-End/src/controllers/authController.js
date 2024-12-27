const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const TokenBlacklist = require('../models/TokenBlacklist');

// Register a new admin
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the admin already exists
    let admin = await Admin.findOne({ username });
    if (admin) {
      return res.status(400).json({ msg: 'Admin already exists' });
    }

    // Create a new admin
    admin = new Admin({
      username,
      password,
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
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Authenticate admin and get token
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for username:', username); // Debug log

  try {
    // Check if admin exists
    const admin = await Admin.findOne({ username });
    console.log('Found admin:', admin ? 'Yes' : 'No'); // Debug log

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check password
    console.log('Checking password...'); // Debug log
    const isMatch = await admin.matchPassword(password);
    console.log('Password match:', isMatch ? 'Yes' : 'No'); // Debug log

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

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
        if (err) {
          console.error('JWT Sign error:', err); // Debug log
          throw err;
        }
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
    console.error('Login error:', err); // Detailed error logging
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Logout admin and blacklist token
exports.logout = (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  // Blacklist the token
  const blacklistToken = new TokenBlacklist({ token });
  blacklistToken.save()
    .then(() => res.status(200).json({ message: 'Logged out successfully' }))
    .catch(err => res.status(500).json({ message: 'Error logging out', error: err }));
};
