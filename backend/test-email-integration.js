require('dotenv').config();
const { sendEmailDirectly } = require('./src/services/email.service');

async function runTest() {
    console.log('Starting email test...');

    const testData = {
        to: 'huznigarane7@gmail.com',
        customerName: 'Huzni Garane',
        customerEmail: 'huznigarane7@gmail.com',
        customerPhone: '0712345678',
        inquiryType: 'General Inquiry',
        message: 'This is a test message to verify the Resend integration with info@dacadmotors.com',
        bookingId: 'TEST-12345',
        pickupDate: new Date(),
        returnDate: new Date(Date.now() + 86400000),
        totalPrice: 5000,
        carName: 'Test Toyota Vitz'
    };

    try {
        console.log('Sending admin inquiry notification to info@dacadmotors.com...');
        const res1 = await sendEmailDirectly('admin-new-inquiry', testData);
        console.log('Admin notification result:', res1);

        console.log('Sending booking confirmation to huznigarane7@gmail.com...');
        const res2 = await sendEmailDirectly('booking-received', testData);
        console.log('Customer booking result:', res2);

        console.log('\nTests completed. Please check both info@dacadmotors.com and huznigarane7@gmail.com');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();
