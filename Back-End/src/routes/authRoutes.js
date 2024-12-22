const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', protect,  logout);

module.exports = router;
