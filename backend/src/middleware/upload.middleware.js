const { upload } = require('../config/cloudinary.config');

/**
 * Middleware to handle car images upload
 * image: main cover image (single)
 * images: additional gallery images (multiple)
 */
exports.uploadCarImage = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]);
