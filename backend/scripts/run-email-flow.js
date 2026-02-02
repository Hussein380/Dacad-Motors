/**
 * Run full Booking + Email flow
 *
 * 1. Ensures admin exists (ADMIN_EMAIL from .env)
 * 2. Creates a booking → "We've Received" (client) + "New Booking" (admin)
 * 3. Logs in as admin, confirms → "Booking Confirmed!" (client)
 *
 * Run: npm run test:email
 * Prerequisites: Backend running, MongoDB + Redis connected
 * Requires: ADMIN_EMAIL, ADMIN_PASSWORD, TEST_EMAIL in .env
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TEST_EMAIL = process.env.TEST_EMAIL || process.env.ADMIN_EMAIL;

async function ensureAdminExists() {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD required in .env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    let user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
        user = await User.create({
            name: 'System Owner',
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin',
        });
        console.log('   ✅ Created admin:', ADMIN_EMAIL);
    } else if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('   ✅ Promoted to admin:', ADMIN_EMAIL);
    } else {
        console.log('   ✅ Admin exists:', ADMIN_EMAIL);
    }
    await mongoose.disconnect();
}

async function runEmailFlow() {
    console.log('\n🧪 Full Booking + Email Flow\n');
    console.log('─'.repeat(55));

    try {
        console.log('\n0. Ensuring admin exists...');
        await ensureAdminExists();

        console.log('\n1. Fetching cars...');
        const carsRes = await fetch(`${BASE_URL}/cars?limit=20`);
        const carsData = await carsRes.json();
        const cars = carsData.data?.cars ?? carsData.data;
        if (!carsData.success || !Array.isArray(cars) || cars.length === 0) {
            throw new Error('No cars found. Run: node seed-kenya-fleet.js');
        }

        console.log('\n2. Fetching locations...');
        const locsRes = await fetch(`${BASE_URL}/cars/locations`);
        const locsData = await locsRes.json();
        const locs = locsData.data;
        const pickupLocation = locsData.success && Array.isArray(locs) && locs.length > 0 ? locs[0] : 'JKIA Airport';
        console.log(`   ✅ Pickup: ${pickupLocation}`);

        const pickupDate = new Date();
        pickupDate.setDate(pickupDate.getDate() + 60);
        const returnDate = new Date(pickupDate);
        returnDate.setDate(returnDate.getDate() + 3);

        let booking = null;
        let bookingMongoId = null;

        for (let i = 0; i < cars.length; i++) {
            const car = cars[i];
            const carId = car._id || car.id;
            const bookingPayload = {
                carId,
                customerName: 'Email Test User',
                customerEmail: TEST_EMAIL,
                customerPhone: '0725996394',
                pickupDate: pickupDate.toISOString(),
                returnDate: returnDate.toISOString(),
                pickupLocation,
                returnLocation: pickupLocation,
                extras: [],
            };

            console.log('\n3. Creating booking...');
            console.log(`   Trying car: ${car.name}`);
            console.log(`   Customer email: ${bookingPayload.customerEmail}`);

            const bookingRes = await fetch(`${BASE_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingPayload),
            });

            const bookingData = await bookingRes.json();

            if (bookingRes.ok) {
                booking = bookingData.data;
                bookingMongoId = booking._id || booking.id;
                console.log(`   ✅ Booking created! ID: ${booking.bookingId}`);
                break;
            }
            if (bookingData.error?.includes('not available')) {
                console.log(`   ⚠️  ${car.name} not available, trying next...`);
            } else {
                throw new Error(bookingData.error || bookingData.message || 'Booking creation failed');
            }
        }

        if (!booking) {
            throw new Error('No car available for selected dates.');
        }

        console.log(`   Total: KES ${(booking.totalPrice || 0).toLocaleString()}`);
        console.log('\n4. Emails queued (on create):');
        console.log('   • "We\'ve Received Your Booking" →', TEST_EMAIL);
        console.log('   • "New Booking - Needs Confirmation" → admin');

        console.log('\n5. Logging in as admin...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok || !loginData.data?.token) {
            throw new Error('Admin login failed: ' + (loginData.error || loginData.message || 'check .env'));
        }

        const token = loginData.data.token;
        console.log('   ✅ Logged in as admin');

        console.log('\n6. Confirming booking...');
        const confirmRes = await fetch(`${BASE_URL}/bookings/${bookingMongoId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'confirmed' }),
        });

        const confirmData = await confirmRes.json();
        if (!confirmRes.ok) {
            throw new Error('Confirm failed: ' + (confirmData.error || confirmData.message));
        }
        console.log('   ✅ Booking confirmed!');
        console.log('   • "Booking Confirmed!" email →', TEST_EMAIL);

        console.log('\n' + '─'.repeat(55));
        console.log('✅ FLOW COMPLETE\n');
        console.log('Check', TEST_EMAIL, 'inbox (and spam):');
        console.log('  • "We\'ve Received Your Booking #' + booking.bookingId + '"');
        console.log('  • "New Booking #' + booking.bookingId + ' – Needs Confirmation"');
        console.log('  • "Booking Confirmed! #' + booking.bookingId + '"');
        console.log('');

    } catch (error) {
        console.error('\n❌ FAILED:', error.message);
        if (error.message?.includes('fetch') || error.message?.includes('ECONNREFUSED')) {
            console.error('\n   Is the backend running? npm run dev');
        }
        process.exit(1);
    }
}

runEmailFlow();
