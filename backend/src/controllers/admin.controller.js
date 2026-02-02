const Booking = require('../models/Booking');
const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalBookings,
            activeBookings,
            totalCars,
            availableCars,
            recentBookings,
            revenueData
        ] = await Promise.all([
            Booking.countDocuments(),
            Booking.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
            Car.countDocuments(),
            Car.countDocuments({ available: true }),
            Booking.find()
                .sort('-createdAt')
                .limit(5)
                .populate('car', 'name brand model'),
            Booking.aggregate([
                { $match: { status: { $ne: 'cancelled' } } },
                { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
            ])
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

        const stats = {
            totalRevenue,
            totalBookings,
            activeBookings,
            totalCars,
            availableCars,
            recentBookings
        };

        sendSuccess(res, stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
