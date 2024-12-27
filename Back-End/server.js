const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const productRoutes = require('./src/routes/productRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes');
const path = require('path');

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON with increased size limit
app.use(express.json({ limit: '50mb' }));

// Middleware to parse URL-encoded data with increased size limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware for CORS
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve uploaded files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Find Card server is running smoothly!');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
