const express = require('express');
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

// Protected routes for admin functionalities
router.post('/add', protect, addProduct);
router.put('/update/:id', protect, updateProduct);
router.delete('/delete/:id', protect, deleteProduct);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

module.exports = router;



