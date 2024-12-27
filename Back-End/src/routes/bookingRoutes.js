const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');

// Route to get all bookings and create a new booking
router.route('/').get(getBookings).post(createBooking);

// Route to get, update, and delete a booking 
router.route('/:id').get(getBookingById).put(updateBooking).delete(deleteBooking);

module.exports = router;
