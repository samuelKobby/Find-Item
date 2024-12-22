const Product = require('../models/productModel');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original file name
  },
});

const upload = multer({ storage });

// Middleware to handle single file upload
const uploadProductImage = upload.single('image');

exports.addProduct = async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { name, price, category } = req.body;
    const image = req.file ? path.basename(req.file.path) : ''; // Extract only the file name

    console.log('File:', req.file);
    console.log('Body:', req.body);

    try {
      const product = new Product({ name, price, category, image });
      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const { name, price, category } = req.body;
    const image = req.file ? req.file.path : req.body.image;

    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      product.name = name || product.name;
      product.price = price || product.price;
      product.category = category || product.category;
      product.image = image || product.image;

      await product.save();
      res.status(200).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

exports.deleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

