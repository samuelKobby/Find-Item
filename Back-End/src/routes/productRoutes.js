const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getProducts);

// Get single product
router.get('/:id', productController.getProductById);

// Add new product
router.post('/add', productController.addProduct);

// Update product - change from /update/:id to /:id
router.put('/:id', productController.updateProduct);

// Delete product - change from /delete/:id to /:id
router.delete('/:id', productController.deleteProduct);

module.exports = router;