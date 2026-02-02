const express = require('express');
const {
    getCars,
    getCarById,
    getFeaturedCars,
    getCategories,
    getLocations,
    createCar,
    updateCar,
    deleteCar
} = require('../controllers/cars.controller');
const { getUnavailableDates } = require('../controllers/bookings.controller');

const { protect, restrictTo } = require('../middleware/auth.middleware');
const { uploadCarImage } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const { carCreateSchema, carUpdateSchema } = require('../utils/schemas/car.schema');
const cache = require('../middleware/cache.middleware');

const router = express.Router();

// Public routes with Redis caching
// TTL values: how long cached data stays valid before refresh
router.get('/', cache(300), getCars);              // 5 mins - car list may change
router.get('/featured', cache(3600), getFeaturedCars);  // 1 hour - featured is stable
router.get('/categories', cache(86400), getCategories); // 1 day - rarely changes
router.get('/locations', cache(86400), getLocations);   // 1 day - fixed locations
router.get('/:id', getCarById);  // No cache - individual car needs fresh data for booking
router.get('/:id/unavailable-dates', getUnavailableDates); // Get booked dates for a car

// Admin routes
router.post('/', protect, restrictTo('admin'), uploadCarImage, validate(carCreateSchema), createCar);
router.put('/:id', protect, restrictTo('admin'), uploadCarImage, validate(carUpdateSchema), updateCar);
router.delete('/:id', protect, restrictTo('admin'), deleteCar);

module.exports = router;
