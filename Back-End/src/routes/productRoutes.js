const express = require('express');
const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/add', addProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
