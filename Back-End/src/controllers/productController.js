const Product = require('../models/productModel');
const multer = require('multer');
const { storage } = require('../config/firebase');
const { ref, uploadBytes, getDownloadURL, deleteObject } = require('firebase/storage');

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

      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      
      // Create a reference to Firebase Storage
      const storageRef = ref(storage, `products/${fileName}`);
      
      try {
        // Upload the file buffer to Firebase
        await uploadBytes(storageRef, req.file.buffer);
        
        // Get the download URL
        const imageUrl = await getDownloadURL(storageRef);

        // Create and save the product
        const product = new Product({
          name,
          category,
          imageUrl,
          fileName // Store filename for future deletion if needed
        });

        await product.save();
        res.status(201).json(product);
      } catch (error) {
        console.error('Firebase operation error:', error);
        res.status(500).json({ error: 'Error uploading image to storage' });
      }
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error' });
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
        const fileName = `${timestamp}-${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `products/${fileName}`);
        try {
          // Upload the file buffer to Firebase
          await uploadBytes(storageRef, req.file.buffer);
          
          // Get the download URL
          imageUrl = await getDownloadURL(storageRef);
        } catch (error) {
          console.error('Firebase operation error:', error);
          res.status(500).json({ error: 'Error uploading image to storage' });
        }
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      product.name = name || product.name;
      product.category = category || product.category;
      product.imageUrl = imageUrl || product.imageUrl;

      await product.save();
      res.status(200).json(product);
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ error: 'Server error' });
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
    
    // Delete the product image from Firebase Storage
    if (product.fileName) {
      const storageRef = ref(storage, `products/${product.fileName}`);
      try {
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Firebase operation error:', error);
        res.status(500).json({ error: 'Error deleting image from storage' });
      }
    }

    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(400).json({ error: error.message });
  }
};
