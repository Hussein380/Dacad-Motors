const express = require('express');
const {
    createInquiry,
    getInquiries,
    getInquiry,
    updateInquiry,
    deleteInquiry
} = require('../controllers/inquiries.controller');

const router = express.Router();

const { protect, restrictTo } = require('../middleware/auth.middleware');

router
    .route('/')
    .post(createInquiry)
    .get(protect, restrictTo('admin', 'staff'), getInquiries);

router
    .route('/:id')
    .get(protect, restrictTo('admin', 'staff'), getInquiry)
    .put(protect, restrictTo('admin', 'staff'), updateInquiry)
    .delete(protect, restrictTo('admin', 'staff'), deleteInquiry);

module.exports = router;
