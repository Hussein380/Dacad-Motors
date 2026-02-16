const Joi = require('joi');

const carCreateSchema = Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    category: Joi.string().valid('economy', 'compact', 'sedan', 'suv', 'safari', 'luxury', 'van', 'truck', 'sports').required(),
    rentPrice: Joi.number().min(0).optional(),
    salePrice: Joi.number().positive().required(),
    seats: Joi.number().integer().positive().required(),
    transmission: Joi.string().valid('automatic', 'manual').required(),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    features: Joi.any(),
    available: Joi.boolean().default(true),
    isFeatured: Joi.boolean().default(false),
    featuredRank: Joi.number().integer().min(0).default(0),
    imageUrl: Joi.string().optional(),
    images: Joi.array().items(Joi.string()).optional(),
    // Sales-specific fields
    mileage: Joi.number().integer().min(0).optional(),
    condition: Joi.string().valid('New', 'Used', 'Certified Pre-Owned').optional(),
    salePrice: Joi.number().positive().required(),
    listingType: Joi.string().valid('Rent', 'Sale', 'Both').default('Rent')
});

const carUpdateSchema = Joi.object({
    brand: Joi.string(),
    model: Joi.string(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    category: Joi.string().valid('economy', 'compact', 'sedan', 'suv', 'safari', 'luxury', 'van', 'truck', 'sports'),
    rentPrice: Joi.number().min(0),
    seats: Joi.number().integer().positive(),
    transmission: Joi.string().valid('automatic', 'manual'),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid'),
    location: Joi.string(),
    description: Joi.string(),
    features: Joi.any(),
    available: Joi.boolean(),
    isFeatured: Joi.boolean(),
    featuredRank: Joi.number().integer().min(0),
    imageUrl: Joi.string(),
    images: Joi.array().items(Joi.string()),
    name: Joi.string(),
    // Sales-specific fields
    mileage: Joi.number().integer().min(0),
    condition: Joi.string().valid('New', 'Used', 'Certified Pre-Owned'),
    salePrice: Joi.number().positive(),
    listingType: Joi.string().valid('Rent', 'Sale', 'Both')
});

module.exports = {
    carCreateSchema,
    carUpdateSchema
};
