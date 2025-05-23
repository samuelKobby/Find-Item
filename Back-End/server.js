const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');
const path = require('path');
const productRoutes = require('./src/routes/productRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const authRoutes = require('./src/routes/authRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

dotenv.config();

// Connect to the database
connectDB();

const app = express();

// Middleware to parse JSON with increased size limit
app.use(express.json({ limit: '50mb' }));

// Middleware to parse URL-encoded data with increased size limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add CORS configuration
app.use(cors({
  origin: ['https://finditem.netlify.app', 'http://localhost:3000', 'https://find-item.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Mount routes
app.use('/api/products', productRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple route for testing
app.get('/', (req, res) => {
  res.send('Find Card server is running smoothly!');
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
