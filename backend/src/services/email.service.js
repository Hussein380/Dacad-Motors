/**
 * Direct email sending via Resend.
 * Used on Vercel (serverless) where BullMQ worker cannot run.
 */
const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_PHONE = '0722344116';
const CONTACT_EMAIL = 'info@dacadmotors.com';

const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to Dacad Motors!',
        html: `<h1>Welcome, ${data.name}!</h1><p>Thank you for joining Dacad Motors – Your Premium Car Partner.</p><p>Questions? Contact us: ${CONTACT_PHONE} | ${CONTACT_EMAIL}</p><p>Best regards, The Dacad Motors Team</p>`,
    }),
    'booking-received': (data) => ({
        subject: `We've Received Your Booking #${data.bookingId}`,
        html: `<h1>Booking Request Received</h1><p>Hi ${data.customerName},</p><p>Thank you for your booking request.</p><p><strong>Booking ID:</strong> ${data.bookingId}</p><p><strong>Pickup:</strong> ${new Date(data.pickupDate).toLocaleDateString()} – ${new Date(data.returnDate).toLocaleDateString()}</p><p><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</p><p>Best regards, The Dacad Motors Team</p>`,
    }),
    'admin-new-booking': (data) => ({
        subject: `New Booking #${data.bookingId} – Needs Confirmation`,
        html: `<h1>New Booking Request</h1><p>Booking ID: ${data.bookingId}</p><p>Customer: ${data.customerName} | ${data.customerEmail}</p><p>Car: ${data.carName || 'N/A'}</p><p>Total: KES ${data.totalPrice.toLocaleString()}</p><p>Log in to the admin dashboard to confirm.</p>`,
    }),
    'booking-confirmation': (data) => ({
        subject: `Booking Confirmed! #${data.bookingId}`,
        html: `<h1>Booking Confirmed!</h1><p>Hi ${data.customerName},</p><p>Your booking has been confirmed.</p><p><strong>Booking ID:</strong> ${data.bookingId}</p><p><strong>Car:</strong> ${data.carName || 'N/A'}</p><p><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</p><p>Best regards, The Dacad Motors Team</p>`,
    }),
    'admin-new-inquiry': (data) => ({
        subject: `New Inquiry from ${data.customerName}`,
        html: `
            <h1>New Car Inquiry</h1>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Phone:</strong> ${data.customerPhone}</p>
            <p><strong>Inquiry Type:</strong> ${data.inquiryType}</p>
            <div style="padding: 15px; background: #f4f4f4; border-radius: 5px; margin: 15px 0;">
                <strong>Message:</strong><br/>
                ${data.message}
            </div>
            <p>Check the admin dashboard for details.</p>
        `,
        to: 'Barrecali123@gmail.com' // Explicit override for admin notifications
    }),
};

const sendEmailDirectly = async (type, data) => {
    if (!process.env.RESEND_API_KEY) {
        logger.warn('RESEND_API_KEY not set, skipping email');
        return null;
    }
    const template = emailTemplates[type];
    if (!template) {
        logger.error(`Unknown email type: ${type}`);
        return null;
    }

    // Preference: template override > provided recipient > fallback
    const recipient = template.to || data.to || data.email || data.customerEmail;

    if (!recipient) {
        logger.error('No recipient for email');
        return null;
    }
    try {
        const emailContent = template(data);
        const result = await resend.emails.send({
            from: 'Dacad Motors <onboarding@resend.dev>',
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
        });
        logger.info(`Email sent directly: ${type} -> ${recipient}`);
        return result;
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
        return null;
    }
};

module.exports = {
    sendEmailDirectly,
    emailTemplates,
};
