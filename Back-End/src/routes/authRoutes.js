const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, logout, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect, logout);
router.get('/verify', protect, verifyToken);

module.exports = router;
