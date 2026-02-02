const Joi = require('joi');

const bookingCreateSchema = Joi.object({
    carId: Joi.string().required().messages({
        'string.empty': 'Car ID is required'
    }),
    customerName: Joi.string().required().messages({
        'string.empty': 'Customer name is required'
    }),
    customerEmail: Joi.string().email().required().messages({
        'string.email': 'Valid customer email is required'
    }),
    customerPhone: Joi.string().allow('').optional().messages({
        'string.base': 'Customer phone must be a string'
    }),
    pickupDate: Joi.string().required().messages({
        'string.empty': 'Pickup date is required'
    }),
    returnDate: Joi.string().required().messages({
        'string.empty': 'Return date is required'
    }),
    pickupLocation: Joi.string().required(),
    returnLocation: Joi.string().required(),
    extras: Joi.array().items(Joi.string()).default([])
    // totalDays and totalPrice are computed server-side, not sent by client
});

const bookingStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'active', 'completed', 'cancelled').required()
});

module.exports = {
    bookingCreateSchema,
    bookingStatusSchema
};
