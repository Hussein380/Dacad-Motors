const express = require('express');
const {
    getMyProfile,
    updatePreferences,
    addFavorite,
    removeFavorite,
    saveSearch,
    deleteSavedSearch
} = require('../controllers/users.controller');

const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Profile & preferences
router.get('/me', getMyProfile);
router.patch('/me/preferences', updatePreferences);

// Favorites
router.post('/me/favorites/:carId', addFavorite);
router.delete('/me/favorites/:carId', removeFavorite);

// Saved searches
router.post('/me/saved-searches', saveSearch);
router.delete('/me/saved-searches/:searchId', deleteSavedSearch);

module.exports = router;
