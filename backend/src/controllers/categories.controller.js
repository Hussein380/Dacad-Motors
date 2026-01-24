const Category = require('../models/Category');
const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');

/**
 * @desc    Get all categories (admin view - includes inactive)
 * @route   GET /api/admin/categories
 * @access  Private/Admin
 */
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort('sortOrder name');
        sendSuccess(res, categories);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

/**
 * @desc    Create a new category
 * @route   POST /api/admin/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
        // Handle duplicate slug error
        if (error.code === 11000) {
            return sendError(res, 'Category with this slug already exists', 400);
        }
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Update a category
 * @route   PUT /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            return sendError(res, 'Category not found', 404);
        }

        sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
        if (error.code === 11000) {
            return sendError(res, 'Category with this slug already exists', 400);
        }
        sendError(res, error.message, 400);
    }
};

/**
 * @desc    Delete/Deactivate a category
 * @route   DELETE /api/admin/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return sendError(res, 'Category not found', 404);
        }

        // Check if any cars are using this category
        const carsUsingCategory = await Car.countDocuments({ category: category.slug });
        
        if (carsUsingCategory > 0) {
            // Soft delete - mark as inactive
            category.isActive = false;
            await category.save();
            return sendSuccess(res, category, `Category deactivated (${carsUsingCategory} cars still use it)`);
        }

        // Hard delete if no cars use it
        await category.deleteOne();
        sendSuccess(res, null, 'Category deleted successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
