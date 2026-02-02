const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'System Owner';

        if (!adminEmail || !adminPassword) {
            console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD required in .env');
            console.error('   Copy .env.example to .env and add your credentials.');
            process.exit(1);
        }

        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log(`User ${adminEmail} already exists. Promoting to admin...`);
            user.role = 'admin';
            user.password = adminPassword;
            await user.save();
            console.log('✅ User successfully promoted/updated to Admin');
        } else {
            console.log(`Creating new Admin user: ${adminEmail}...`);
            await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin',
            });
            console.log('✅ New Admin user successfully created');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
