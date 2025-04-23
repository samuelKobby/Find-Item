const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
  createReport, 
  getReports, 
  getReportById, 
  updateReportStatus, 
  deleteReport 
} = require('../controllers/reportController');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Routes
router.post('/', upload.single('image'), createReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.patch('/:id/status', updateReportStatus);
router.delete('/:id', deleteReport);

module.exports = router;
