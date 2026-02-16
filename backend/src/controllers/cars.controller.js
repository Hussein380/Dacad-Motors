const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');
const { NAIROBI_LOCATIONS } = require('../config/locations.config');
const { clearCarCache } = require('../config/redis.config');

// @desc    Get all cars with filters/search
// @route   GET /api/cars
// @access  Public
exports.getCars = async (req, res) => {
    try {
        const query = { ...req.query };

        // Remove fields that are not direct filters on the Car model
        // 'path' is added by Vercel rewrites, must be excluded
        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'featured', 'path'];
        removeFields.forEach(param => delete query[param]);

        // Create query string for advanced operators ($gt, $gte, etc)
        let queryStr = JSON.stringify(query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

        let mongooseQuery = Car.find(JSON.parse(queryStr));

        // Text search
        if (req.query.search) {
            mongooseQuery = Car.find({
                $text: { $search: req.query.search },
                ...JSON.parse(queryStr)
            });
        }

        // Select Fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            mongooseQuery = mongooseQuery.select(fields);
        }

        // Sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            mongooseQuery = mongooseQuery.sort(sortBy);
        } else {
            mongooseQuery = mongooseQuery.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 24;
        const startIndex = (page - 1) * limit;
        const total = await Car.countDocuments(JSON.parse(queryStr));

        mongooseQuery = mongooseQuery.skip(startIndex).limit(limit);

        // Executing query
        const cars = await mongooseQuery;

        sendSuccess(res, {
            cars,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }
        sendSuccess(res, car);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get featured cars (hybrid: admin-selected + top-rated fallback)
// @route   GET /api/cars/featured
// @access  Public
exports.getFeaturedCars = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 6;
        const now = new Date();

        // Step 1: Get admin-featured cars (not expired)
        const featuredQuery = {
            isFeatured: true,
            available: true,
            $or: [
                { featuredUntil: null },
                { featuredUntil: { $gte: now } }
            ]
        };

        const adminFeatured = await Car.find(featuredQuery)
            .sort('-featuredRank -createdAt')
            .limit(limit);

        // Step 2: If we need more, fill with top-rated
        let cars = adminFeatured;
        if (cars.length < limit) {
            const excludeIds = cars.map(c => c._id);
            const topRated = await Car.find({
                rating: { $gte: 4.5 },
                available: true,
                _id: { $nin: excludeIds }
            })
                .sort('-rating')
                .limit(limit - cars.length);

            cars = [...cars, ...topRated];
        }

        sendSuccess(res, cars);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get all active categories (from Category model)
// @route   GET /api/cars/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const Category = require('../models/Category');
        const categories = await Category.find({ isActive: true })
            .select('slug name icon sortOrder')
            .sort('sortOrder name');

        // Map to frontend format: {id, name, icon}
        const mapped = categories.map(cat => ({
            id: cat.slug,
            name: cat.name,
            icon: cat.icon
        }));

        sendSuccess(res, mapped);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get all unique brands
// @route   GET /api/cars/brands
// @access  Public
exports.getBrands = async (req, res) => {
    try {
        const brands = await Car.distinct('brand');
        sendSuccess(res, brands.sort());
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get all unique years
// @route   GET /api/cars/years
// @access  Public
exports.getYears = async (req, res) => {
    try {
        const years = await Car.distinct('year');
        sendSuccess(res, years.sort((a, b) => b - a)); // Sort descending (newest first)
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get pickup/return locations (Nairobi only)
// @route   GET /api/cars/locations
// @access  Public
exports.getLocations = async (req, res) => {
    try {
        sendSuccess(res, NAIROBI_LOCATIONS);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Create car
// @route   POST /api/cars
// @access  Private/Admin
exports.createCar = async (req, res) => {
    try {
        const carData = { ...req.body };

        // If files were uploaded, use their URLs
        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                carData.imageUrl = req.files.image[0].path;
            }
            if (req.files.images) {
                carData.images = req.files.images.map(file => file.path);
            }
        }

        // Handle nested or stringified features/data if sent via FormData
        if (typeof carData.features === 'string') {
            try {
                carData.features = JSON.parse(carData.features);
            } catch (e) {
                carData.features = carData.features.split(',').map(f => f.trim());
            }
        }


        // Generate name from brand and model if missing
        if (!carData.name && carData.brand && carData.model) {
            carData.name = `${carData.brand} ${carData.model}`;
        }

        // DEBUG: Log the data being sent to Car.create
        console.log('=== CREATE CAR DEBUG ===');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        console.log('Files:', req.files);
        console.log('Final carData:', JSON.stringify(carData, null, 2));
        console.log('========================');

        const car = await Car.create(carData);
        await clearCarCache();
        sendSuccess(res, car, 'Car created successfully', 201);
    } catch (error) {
        console.error('=== CREATE CAR ERROR ===');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
        console.error('Full Error:', error);
        console.error('========================');
        sendError(res, error.message, 400);
    }
};

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private/Admin
exports.updateCar = async (req, res) => {
    try {
        let car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        const carData = { ...req.body };

        // Handle images: Merge existingGallery, new uploads, or handle explicit body updates
        let existingImages = [];
        if (carData.existingImages) {
            try {
                existingImages = typeof carData.existingImages === 'string'
                    ? JSON.parse(carData.existingImages)
                    : carData.existingImages;
            } catch (e) {
                existingImages = carData.existingImages.split(',').map(img => img.trim());
            }
        } else if (!req.files?.images && !req.body.images && car.images) {
            // Only fallback to current if no existingImages AND no new files AND no images field sent
            existingImages = car.images;
        }

        if (req.files) {
            if (req.files.image && req.files.image[0]) {
                carData.imageUrl = req.files.image[0].path;
            }

            if (req.files.images) {
                const newImages = req.files.images.map(file => file.path);
                carData.images = [...existingImages, ...newImages];
            } else {
                carData.images = existingImages;
            }
        } else if (carData.existingImages || carData.images) {
            // Handle case where body has existingImages or images but no files
            carData.images = existingImages;
        }

        // Final safety check: if 'images' is still a string in carData, parse it
        if (typeof carData.images === 'string') {
            try {
                carData.images = JSON.parse(carData.images);
            } catch (e) {
                carData.images = carData.images.split(',').map(img => img.trim());
            }
        }

        // Handle stringified features
        if (typeof carData.features === 'string') {
            try {
                carData.features = JSON.parse(carData.features);
            } catch (e) {
                carData.features = carData.features.split(',').map(f => f.trim());
            }
        }

        // Generate name from brand and model if missing
        if (!carData.name && carData.brand && carData.model) {
            carData.name = `${carData.brand} ${carData.model}`;
        }

        car = await Car.findByIdAndUpdate(req.params.id, carData, {
            new: true,
            runValidators: true
        });

        await clearCarCache();
        sendSuccess(res, car, 'Car updated successfully');
    } catch (error) {
        console.error('Update Car Error:', error);
        sendError(res, error.message, 400);
    }
};

// @desc    Delete car
// @route   DELETE /api/cars/:id
// @access  Private/Admin
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findById(req.params.id);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        await car.deleteOne();
        await clearCarCache();
        sendSuccess(res, null, 'Car deleted successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
