const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    slug: {
        type: String,
        required: [true, 'Please add a category slug'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase letters, numbers, hyphens only)']
    },
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true
    },
    icon: {
        type: String,
        default: '🚗'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
categorySchema.pre('save', function() {
    this.updatedAt = Date.now();
});

module.exports = mongoose.model('Category', categorySchema);
