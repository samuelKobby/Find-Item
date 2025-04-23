const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required']
  },
  location: {
    type: String,
    required: [true, 'Location where item was found is required']
  },
  dropOffLocation: {
    type: String,
    required: [true, 'Drop-off location is required'],
    enum: ['security_office', 'library', 'info_desk', 'student_center']
  },
  date: {
    type: Date,
    required: [true, 'Date found is required']
  },
  description: {
    type: String,
    required: [true, 'Item description is required']
  },
  finderName: {
    type: String,
    required: [true, 'Finder name is required']
  },
  finderContact: {
    type: String,
    required: [true, 'Finder contact is required']
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'expired'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
