const Product = require('../models/productModel');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Invalid file type. Only images are allowed!'), false);
    }
    cb(null, true);
  }
});

// Middleware to handle single file upload
const uploadProductImage = upload.single('image');

exports.addProduct = async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, category } = req.body;
      
      if (!name || !category) {
        return res.status(400).json({ error: 'Name and category are required' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // Convert buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      const imageString = `data:${req.file.mimetype};base64,${base64Image}`;

      // Create and save the product
      const product = new Product({
        name,
        category,
        image: imageString
      });

      await product.save();
      console.log('Product saved to database');
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ 
        error: 'Server error',
        details: error.message
      });
    }
  });
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error fetching product' });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, category } = req.body;
      let imageString = undefined;

      if (req.file) {
        // Convert new image to base64 if provided
        const base64Image = req.file.buffer.toString('base64');
        imageString = `data:${req.file.mimetype};base64,${base64Image}`;
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update fields if provided
      if (name) product.name = name;
      if (category) product.category = category;
      if (imageString) product.image = imageString;

      await product.save();
      res.json(product);
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Error updating product' });
    }
  });
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product' });
  }
};
