const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

adminSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    console.log('Hashing password...'); // Debug log
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully'); // Debug log
    next();
  } catch (error) {
    console.error('Password hashing error:', error); // Debug log
    next(error);
  }
});

adminSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log('Comparing passwords...'); // Debug log
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', isMatch); // Debug log
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error); // Debug log
    throw error;
  }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
