const Product = require('../models/productModel');
const multer = require('multer');
const { storage } = require('../config/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
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
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${req.file.originalname}`;
      
      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `products/${fileName}`);
      
      // Upload the file buffer to Firebase
      await uploadBytes(storageRef, req.file.buffer);
      
      // Get the download URL
      const imageUrl = await getDownloadURL(storageRef);

      console.log('File uploaded successfully:', imageUrl);

      const product = new Product({
        name,
        category,
        image: imageUrl // Store the download URL in the database
      });

      await product.save();
      res.status(201).json(product);
    } catch (error) {
      console.error('Product creation error:', error);
      res.status(400).json({ error: error.message });
    }
  });
};

exports.updateProduct = async (req, res) => {
  uploadProductImage(req, res, async function (err) {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, category } = req.body;
      let imageUrl = req.body.image; // Keep existing image URL if no new file

      if (req.file) {
        // Upload new image to Firebase
        const timestamp = Date.now();
        const fileName = `${timestamp}-${req.file.originalname}`;
        const storageRef = ref(storage, `products/${fileName}`);
        await uploadBytes(storageRef, req.file.buffer);
        imageUrl = await getDownloadURL(storageRef);
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      product.name = name || product.name;
      product.category = category || product.category;
      product.image = imageUrl || product.image;

      await product.save();
      res.status(200).json(product);
    } catch (error) {
      console.error('Product update error:', error);
      res.status(400).json({ error: error.message });
    }
  });
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error('Product retrieval error:', error);
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
    console.error('Product retrieval error:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(400).json({ error: error.message });
  }
};
