const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a car name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Please add a model'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'Please add a year']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        lowercase: true,
        trim: true
        // No enum - validates against Category collection dynamically
    },
    rentPrice: {
        type: Number,
        required: false,
        default: 0
    },
    imageUrl: {
        type: String,
        required: false // Populated from file upload
    },
    images: {
        type: [String],
        default: []
    },
    seats: {
        type: Number,
        required: [true, 'Please add number of seats']
    },
    transmission: {
        type: String,
        required: [true, 'Please add transmission type'],
        enum: ['automatic', 'manual']
    },
    fuelType: {
        type: String, // electric, petrol, diesel, hybrid, etc.
        required: [true, 'Please add fuel type'],
        enum: ['petrol', 'diesel', 'electric', 'hybrid']
    },
    features: {
        type: [String],
        default: []
    },
    location: {
        type: String, // Reference name from Location model or just string
        required: [true, 'Please add a location']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    available: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredRank: {
        type: Number,
        default: 0
    },
    featuredUntil: {
        type: Date,
        default: null
    },
    salePrice: {
        type: Number,
        required: true,
        default: 0
    },
    mileage: {
        type: Number,
        required: false // Optional
    },
    condition: {
        type: String,
        enum: ['New', 'Used', 'Certified Pre-Owned'],
        required: false
    },
    listingType: {
        type: String,
        enum: ['Rent', 'Sale', 'Both'],
        default: 'Sale'
    },
    previousOwners: {
        type: Number,
        default: 0
    },
    historyUrl: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Helper function to title case strings
const titleCase = (str) => {
    if (!str) return str;
    return str.trim()
        .toLowerCase()
        .replace(/(^|\s|-)\S/g, (match) => match.toUpperCase());
};

// Pre-save hook for data normalization
carSchema.pre('save', async function () {
    if (this.brand) {
        this.brand = titleCase(this.brand);
    }
    if (this.model) {
        this.model = titleCase(this.model);
    }
    // Update the name if it's missing or if brand/model changed
    if (this.isModified('brand') || this.isModified('model') || !this.name) {
        this.name = `${this.brand} ${this.model}`;
    }
});

// Index for search functionality
carSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
