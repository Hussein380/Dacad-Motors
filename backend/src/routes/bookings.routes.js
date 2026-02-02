const express = require('express');
const {
    createBooking,
    getBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    getBookingExtras
} = require('../controllers/bookings.controller');

const { protect, restrictTo, optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { bookingCreateSchema, bookingStatusSchema } = require('../utils/schemas/booking.schema');

const router = express.Router();

// Public routes
router.get('/extras', getBookingExtras);

// Combined routes for '/'
// POST uses optionalAuth so logged-in users get their booking linked to their account
router.route('/')
    .get(protect, restrictTo('admin'), getBookings)
    .post(optionalAuth, validate(bookingCreateSchema), createBooking);

// Protected routes (User or Admin)
router.get('/my', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.delete('/:id', protect, cancelBooking);

// Admin-only routes
router.patch('/:id/status', protect, restrictTo('admin'), validate(bookingStatusSchema), updateBookingStatus);

module.exports = router;
