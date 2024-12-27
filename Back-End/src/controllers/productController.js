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
}).single('image'); // Move single() here

exports.addProduct = async (req, res) => {
  try {
    // Log the request body and file
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Handle file upload first
    await new Promise((resolve, reject) => {
      upload(req, res, function(err) {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        }
        resolve();
      });
    });

    // Check if we have the file after upload
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'Image is required' });
    }

    const { name, category } = req.body;
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${req.file.originalname}`;
    
    console.log('Creating Firebase storage reference for:', fileName);
    
    // Create a reference to Firebase Storage
    const storageRef = ref(storage, `products/${fileName}`);
    
    console.log('Uploading file to Firebase...');
    
    // Upload the file buffer to Firebase
    const snapshot = await uploadBytes(storageRef, req.file.buffer);
    console.log('File uploaded to Firebase:', snapshot);
    
    // Get the download URL
    const imageUrl = await getDownloadURL(storageRef);
    console.log('Got download URL:', imageUrl);

    // Create and save the product
    const product = new Product({
      name,
      category,
      image: imageUrl
    });

    const savedProduct = await product.save();
    console.log('Product saved:', savedProduct);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Full error details:', error);
    res.status(400).json({ 
      error: error.message,
      stack: error.stack,
      details: 'Error occurred while processing the request'
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Handle file upload first
    await new Promise((resolve, reject) => {
      upload(req, res, function(err) {
        if (err) {
          console.error('Multer error:', err);
          reject(err);
        }
        resolve();
      });
    });

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
    console.error('Full error details:', error);
    res.status(400).json({ 
      error: error.message,
      stack: error.stack,
      details: 'Error occurred while updating the product'
    });
  }
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
