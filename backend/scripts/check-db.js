/**
 * Quick script to verify MongoDB has cars.
 * Run: node scripts/check-db.js
 * Or with explicit URI: MONGODB_URI="your-uri" node scripts/check-db.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../src/models/Car');

async function check() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        console.error('❌ MONGODB_URI not set in .env');
        process.exit(1);
    }
    // Mask URI for safe display (show only cluster part)
    const masked = uri.replace(/:[^:@]+@/, ':****@');
    console.log('🔗 Connecting to:', masked);
    try {
        await mongoose.connect(uri);
        const count = await Car.countDocuments();
        console.log('✅ Connected. Cars in DB:', count);
        if (count === 0) {
            console.log('\n⚠️  Database is EMPTY. Run: node seed-kenya-fleet.js');
        } else {
            const sample = await Car.findOne().select('name brand');
            console.log('   Sample:', sample?.name, '-', sample?.brand);
        }
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}
check();
