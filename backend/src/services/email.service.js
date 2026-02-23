const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);

const CONTACT_PHONE = '0722344116';
const CONTACT_EMAIL = 'info@dacadmotors.com';
const WHATSAPP_LINK = 'https://wa.me/254722344116';
const LOGO_URL = 'https://dacadmotors.com/logo.jpeg';

const baseLayout = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
        .header { background: #f8f8f8; padding: 20px; text-align: center; border-bottom: 2px solid #e11d48; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 30px; background: #ffffff; }
        .footer { background: #111827; color: #ffffff; padding: 30px; text-align: center; font-size: 14px; }
        .button { 
            display: inline-block; padding: 12px 24px; background-color: #e11d48; color: #ffffff !important; 
            text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;
        }
        .whatsapp-button {
            display: inline-block; padding: 12px 24px; background-color: #25D366; color: #ffffff !important; 
            text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;
        }
        .contact-info { margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px; }
        h1 { color: #111827; font-size: 24px; }
        .label { font-weight: bold; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${LOGO_URL}" alt="Dacad Motors" class="logo">
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>Dacad Motors</strong><br>Premium Car Sales Experience</p>
            <p>Nairobi & Mombasa, Kenya</p>
            <p>
                <a href="tel:${CONTACT_PHONE}" style="color: #ffffff;">${CONTACT_PHONE}</a> | 
                <a href="mailto:${CONTACT_EMAIL}" style="color: #ffffff;">${CONTACT_EMAIL}</a>
            </p>
            <div style="margin-top: 15px;">
                <a href="${WHATSAPP_LINK}" class="whatsapp-button">Chat on WhatsApp</a>
            </div>
            <p style="margin-top: 20px; opacity: 0.6; font-size: 12px;">
                © ${new Date().getFullYear()} Dacad Motors. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to Dacad Motors – Your Premium Car Partner',
        html: baseLayout(`
            <h1>Welcome, ${data.name}!</h1>
            <p>Thank you for choosing Dacad Motors. We are thrilled to help you find your next premium vehicle.</p>
            <p>Explore our exclusive collection and let us know if any car catches your eye. Our team is ready to provide you with the best car buying experience in Kenya.</p>
            <div class="contact-info">
                <p><strong>Need immediate assistance?</strong></p>
                <a href="${WHATSAPP_LINK}" class="whatsapp-button">Talk to a Sales Expert</a>
            </div>
        `),
    }),
    'booking-received': (data) => ({
        subject: `Reservation Received: ${data.carName || 'Vehicle'} (#${data.bookingId})`,
        html: baseLayout(`
            <h1>Vehicle Reservation Received</h1>
            <p>Hi ${data.customerName},</p>
            <p>Thank you for expressing interest in the <strong>${data.carName || 'Vehicle'}</strong>. We have received your reservation request and our sales team will contact you shortly to arrange a viewing or discuss the next steps.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><span class="label">Reservation ID:</span> ${data.bookingId}</p>
                <p><span class="label">Vehicle:</span> ${data.carName || 'N/A'}</p>
                <p><span class="label">Total Price:</span> KES ${data.totalPrice.toLocaleString()}</p>
            </div>

            <p>Would you like to speed up the process? Message us directly on WhatsApp with your reservation ID.</p>
            <a href="${WHATSAPP_LINK}" class="whatsapp-button">Chat on WhatsApp Now</a>
        `),
    }),
    'admin-new-booking': (data) => ({
        subject: `Action Required: New Sales Reservation #${data.bookingId}`,
        html: baseLayout(`
            <h1>New Sales Reservation</h1>
            <p>A customer has reserved a vehicle online.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><span class="label">Customer:</span> ${data.customerName}</p>
                <p><span class="label">Contact:</span> ${data.customerEmail} | ${data.customerPhone}</p>
                <p><span class="label">Car:</span> ${data.carName || 'N/A'}</p>
                <p><span class="label">Total:</span> KES ${data.totalPrice.toLocaleString()}</p>
            </div>
            <p>Please log in to the admin dashboard to process this reservation and contact the customer.</p>
            <a href="https://dacadmotors.com/admin" class="button">Go to Admin Dashboard</a>
        `),
    }),
    'booking-confirmation': (data) => ({
        subject: `Reservation Confirmed! #${data.bookingId}`,
        html: baseLayout(`
            <h1>Reservation Confirmed!</h1>
            <p>Hi ${data.customerName},</p>
            <p>Your reservation for the <strong>${data.carName || 'N/A'}</strong> has been officially confirmed.</p>
            <p>Our team is now preparing the necessary documentation and will reach out to schedule your visit.</p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><span class="label">Reservation ID:</span> ${data.bookingId}</p>
                <p><span class="label">Vehicle:</span> ${data.carName || 'N/A'}</p>
            </div>

            <p>If you have any questions, feel free to call us or reach out via WhatsApp.</p>
            <a href="${WHATSAPP_LINK}" class="whatsapp-button">Message Support</a>
        `),
    }),
    'admin-new-inquiry': (data) => ({
        subject: `New Car Inquiry from ${data.customerName}`,
        html: baseLayout(`
            <h1>New Car Inquiry</h1>
            <p>You have received a new inquiry from the website contact form.</p>
            
            <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><span class="label">Customer:</span> ${data.customerName}</p>
                <p><span class="label">Email:</span> ${data.customerEmail}</p>
                <p><span class="label">Phone:</span> ${data.customerPhone}</p>
                <p><span class="label">Inquiry Type:</span> ${data.inquiryType}</p>
                ${data.carName ? `<p><span class="label">Car:</span> ${data.carName}</p>` : ''}
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">
                <p><strong>Message:</strong></p>
                <p>${data.message}</p>
            </div>
            
            <p>Follow up with the customer as soon as possible.</p>
            <a href="https://dacadmotors.com/admin" class="button">Go to Admin Dashboard</a>
        `),
    }),
    'inquiry-received': (data) => ({
        subject: `We've received your inquiry: ${data.carName || 'Dacad Motors'}`,
        html: baseLayout(`
            <h1>Hi ${data.customerName},</h1>
            <p>Thank you for reaching out to Dacad Motors! This is to confirm that we have received your inquiry regarding the <strong>${data.carName || 'car you are interested in'}</strong>.</p>
            
            <p>Our sales team is currently reviewing your request and will get back to you shortly via email or phone (${data.customerPhone}) to discuss the details or arrange a viewing.</p>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><span class="label">Inquiry Type:</span> ${data.inquiryType}</p>
                <p><span class="label">Reference ID:</span> #${data.inquiryId}</p>
            </div>

            <p>In the meantime, feel free to browse more of our premium collection or chat with us directly on WhatsApp for faster assistance.</p>
            
            <a href="${WHATSAPP_LINK}" class="whatsapp-button">Chat on WhatsApp Now</a>
        `),
    }),
};

const sendEmailDirectly = async (type, data) => {
    if (!process.env.RESEND_API_KEY) {
        logger.warn('RESEND_API_KEY not set, skipping email');
        return null;
    }
    const templateFunction = emailTemplates[type];
    if (!templateFunction) {
        logger.error(`Unknown email type: ${type}`);
        return null;
    }

    const emailContent = templateFunction(data);

    // Preference: template override > provided recipient > fallback
    const recipient = emailContent.to || data.to || data.email || data.customerEmail;

    if (!recipient) {
        logger.error('No recipient for email');
        return null;
    }

    try {
        const result = await resend.emails.send({
            from: 'Dacad Motors <info@dacadmotors.com>',
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
        });

        if (result.error) {
            logger.error(`Resend API Error: ${result.error.message}`);
        } else {
            logger.info(`Email sent directly: ${type} -> ${recipient}`);
        }

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

