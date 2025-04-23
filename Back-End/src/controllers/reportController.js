const Report = require('../models/reportModel');
const notificationapi = require('notificationapi-node-server-sdk').default;

// Initialize notification API with your credentials
notificationapi.init(
  'oiamlkyvifzw3ternnibp7pe06', 
  '748ng4h843wpc8druxk5dzf72fy7cl2rq4rog49vj0fnl1jeholukqua0z'
);

// Create a new report
const createReport = async (req, res) => {
  try {
    const reportData = req.body;
    
    // Add image URL if an image was uploaded
    if (req.file) {
      reportData.imageUrl = req.file.path;
    }

    const report = await Report.create(reportData);

    // Send notification to admin
    const sendReportNotification = (report) => {
      notificationapi.send({
        notificationId: 'new_found_item',
        user: {
          id: "tipsyalleygh@gmail.com",
          email: "samuelgyasifordjour@gmail.com",
          number: "+233248425044"
        },
        mergeTags: {
          "report": {
            "itemName": report.itemName,
            "location": report.location,
            "dropOffLocation": report.dropOffLocation,
            "finderName": report.finderName,
            "finderContact": report.finderContact
          }
        }
      });
    };

    sendReportNotification(report);

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all reports
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single report
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'claimed', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport
};
