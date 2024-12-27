const Booking = require('../models/bookingModel');
const notificationapi = require('notificationapi-node-server-sdk').default;

// Initialize notification API
notificationapi.init(
  'oiamlkyvifzw3ternnibp7pe06', 
  '748ng4h843wpc8druxk5dzf72fy7cl2rq4rog49vj0fnl1jeholukqua0z'
);

const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    const sendBookingNotification = (booking) => {
      notificationapi.send({
        notificationId: 'new_bookings',
        user: {
          id: "tipsyalleygh@gmail.com",
          email: "tipsyalleygh@gmail.com",
          number: "+233244403944" 
        },
        mergeTags: {
          "booking": {
            "customerName": booking.customerName,
            "contact1": booking.contact1,
            "eventDate": booking.eventDate,
            "eventTime": booking.eventTime,
            "eventLocation": booking.eventLocation
          }
        }
      });
    };

    sendBookingNotification(booking);

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
