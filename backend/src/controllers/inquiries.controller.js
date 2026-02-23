const Inquiry = require('../models/Inquiry');
const Car = require('../models/Car');
const { sendSuccess, sendError } = require('../utils/response');
const { sendEmailDirectly } = require('../services/email.service');
const logger = require('../utils/logger');

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Public
exports.createInquiry = async (req, res) => {
    try {
        // Map carId from frontend to car for Mongoose
        if (req.body.carId) {
            req.body.car = req.body.carId;
        }

        // Add user to body if logged in
        if (req.user) {
            req.body.user = req.user.id;
        }

        const inquiry = await Inquiry.create(req.body);

        // Fetch car name for email personalization
        let carName = null;
        if (inquiry.car) {
            const car = await Car.findById(inquiry.car).select('name brand model').lean();
            if (car) {
                carName = `${car.brand} ${car.name}`;
            }
        }

        // 1. Notify Admin
        await sendEmailDirectly('admin-new-inquiry', {
            to: process.env.ADMIN_EMAIL || 'info@dacadmotors.com',
            customerName: inquiry.customerName,
            customerEmail: inquiry.email,
            customerPhone: inquiry.phone,
            message: inquiry.message,
            inquiryType: inquiry.type,
            inquiryId: inquiry._id,
            carName
        });

        // 2. Notify Client
        await sendEmailDirectly('inquiry-received', {
            to: inquiry.email,
            customerName: inquiry.customerName,
            customerPhone: inquiry.phone,
            inquiryType: inquiry.type,
            inquiryId: inquiry._id,
            carName
        });

        sendSuccess(res, inquiry, 'Inquiry sent successfully', 201);
    } catch (error) {
        logger.error(`Inquiry creation failed: ${error.message}`);
        sendError(res, error.message, 400);
    }
};

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private/Admin
exports.getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().populate('car', 'name brand model salePrice').sort('-createdAt');

        sendSuccess(res, inquiries);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private/Admin
exports.getInquiry = async (req, res) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id).populate('car', 'name brand model image');

        if (!inquiry) {
            return sendError(res, `No inquiry found with id of ${req.params.id}`, 404);
        }

        sendSuccess(res, inquiry);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private/Admin
exports.updateInquiry = async (req, res) => {
    try {
        let inquiry = await Inquiry.findById(req.params.id);

        if (!inquiry) {
            return sendError(res, `No inquiry found with id of ${req.params.id}`, 404);
        }

        inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        sendSuccess(res, inquiry, 'Inquiry updated successfully');
    } catch (error) {
        sendError(res, error.message, 400);
    }
};
