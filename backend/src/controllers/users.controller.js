const User = require('../models/User');
const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get current user profile with personalization
 * @route   GET /api/users/me
 * @access  Private
 */
exports.getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('favorites', 'name brand model imageUrl rentPrice category');

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        sendSuccess(res, user);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

/**
 * @desc    Update user preferences
 * @route   PATCH /api/users/me/preferences
 * @access  Private
 */
exports.updatePreferences = async (req, res) => {
    try {
        const allowedFields = [
            'preferredPickupLocations',
            'preferredReturnLocations',
            'preferredCategorySlugs'
        ];

        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        sendSuccess(res, user, 'Preferences updated successfully');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Add car to favorites
 * @route   POST /api/users/me/favorites/:carId
 * @access  Private
 */
exports.addFavorite = async (req, res) => {
    try {
        const { carId } = req.params;

        // Check if car exists
        const car = await Car.findById(carId);
        if (!car) {
            return sendError(res, 'Car not found', 404);
        }

        const user = await User.findById(req.user._id);

        // Check if already in favorites
        if (user.favorites.includes(carId)) {
            return sendError(res, 'Car already in favorites', 400);
        }

        user.favorites.push(carId);
        await user.save();

        const updatedUser = await User.findById(req.user._id)
            .select('-password')
            .populate('favorites', 'name brand model imageUrl rentPrice category');

        sendSuccess(res, updatedUser, 'Car added to favorites');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Remove car from favorites
 * @route   DELETE /api/users/me/favorites/:carId
 * @access  Private
 */
exports.removeFavorite = async (req, res) => {
    try {
        const { carId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { favorites: carId } },
            { new: true }
        ).select('-password').populate('favorites', 'name brand model imageUrl rentPrice category');

        sendSuccess(res, user, 'Car removed from favorites');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Save a search
 * @route   POST /api/users/me/saved-searches
 * @access  Private
 */
exports.saveSearch = async (req, res) => {
    try {
        const { name, filters } = req.body;

        if (!name || !filters) {
            return sendError(res, 'Name and filters are required', 400);
        }

        const user = await User.findById(req.user._id);

        // Limit to 10 saved searches
        if (user.savedSearches.length >= 10) {
            return sendError(res, 'Maximum 10 saved searches allowed', 400);
        }

        user.savedSearches.push({ name, filters });
        await user.save();

        const updatedUser = await User.findById(req.user._id).select('-password');
        sendSuccess(res, updatedUser, 'Search saved successfully');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Delete a saved search
 * @route   DELETE /api/users/me/saved-searches/:searchId
 * @access  Private
 */
exports.deleteSavedSearch = async (req, res) => {
    try {
        const { searchId } = req.params;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { savedSearches: { _id: searchId } } },
            { new: true }
        ).select('-password');

        sendSuccess(res, user, 'Saved search deleted');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};
