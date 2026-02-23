const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler.middleware');
const { sendSuccess, sendError } = require('./utils/response');
const { globalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// Trust proxy (required for Vercel/reverse proxies)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

// HTTP Request Logging (Morgan + Winston)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => logger.http(message.trim()),
    },
}));

// Security: Rate Limiting (Applied to all /api routes)
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cars', require('./routes/cars.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/inquiries', require('./routes/inquiries.routes'));

// Base route for health check
app.get('/', (req, res) => {
    sendSuccess(res, { status: 'online', version: '1.0.0' }, 'DriveEase API is running');
});

// Debug endpoint - shows which MongoDB database is connected
app.get('/api/debug', async (req, res) => {
    const mongoose = require('mongoose');
    const Car = require('./models/Car');
    try {
        const dbName = mongoose.connection?.db?.databaseName || 'not connected';
        const carCount = await Car.countDocuments();
        const mongoUri = process.env.MONGODB_URI || 'not set';
        // Mask password in URI for safety
        const maskedUri = mongoUri.replace(/:[^:@]+@/, ':****@');
        sendSuccess(res, {
            database: dbName,
            carCount,
            mongoUri: maskedUri,
            redisUrl: process.env.REDIS_URL ? 'set' : 'not set',
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
        });
    } catch (err) {
        sendError(res, err.message, 500);
    }
});

// Test endpoint - returns cars directly (no cache) + request debugging
app.get('/api/test-cars', async (req, res) => {
    const Car = require('./models/Car');
    try {
        const cars = await Car.find({}).limit(5);
        sendSuccess(res, {
            count: cars.length,
            cars: cars.map(c => ({ id: c._id, name: c.name, brand: c.brand })),
            debug: {
                originalUrl: req.originalUrl,
                url: req.url,
                path: req.path,
                query: req.query,
                baseUrl: req.baseUrl
            }
        });
    } catch (err) {
        sendError(res, err.message, 500);
    }
});

// Debug route - test cars query with full logging
app.get('/api/debug-cars', async (req, res) => {
    const mongoose = require('mongoose');
    const Car = require('./models/Car');
    const { client } = require('./config/redis.config');

    try {
        // Same query logic as getCars controller
        const query = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'featured', 'path'];
        removeFields.forEach(param => delete query[param]);

        let queryStr = JSON.stringify(query);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        const parsedQuery = JSON.parse(queryStr);

        const total = await Car.countDocuments(parsedQuery);
        const cars = await Car.find(parsedQuery).limit(5);

        sendSuccess(res, {
            total,
            sampleCount: cars.length,
            sample: cars.map(c => ({ id: c._id, name: c.name })),
            debug: {
                originalUrl: req.originalUrl,
                rawQuery: req.query,
                parsedQuery,
                dbName: mongoose.connection?.db?.databaseName,
                redisConnected: client?.isOpen || false
            }
        });
    } catch (err) {
        sendError(res, err.message, 500);
    }
});

// Dynamic Sitemap Generator
app.get('/api/sitemap', async (req, res) => {
    const Car = require('./models/Car');
    try {
        const cars = await Car.find({ available: true }).select('_id updatedAt').lean();
        const baseUrl = 'https://dacadmotors.com';

        const staticPages = [
            { url: '/', priority: '1.0', freq: 'daily' },
            { url: '/cars', priority: '0.9', freq: 'daily' },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

        // Add static pages
        staticPages.forEach(page => {
            xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        });

        // Add car detail pages
        cars.forEach(car => {
            const lastMod = car.updatedAt ? new Date(car.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += `
  <url>
    <loc>${baseUrl}/cars/${car._id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        });

        xml += '\n</urlset>';

        res.header('Content-Type', 'application/xml');
        res.status(200).send(xml);
    } catch (err) {
        logger.error(`Sitemap generation failed: ${err.message}`);
        res.status(500).end();
    }
});


// Handle 404
app.use((req, res) => {
    sendError(res, 'Route not found', 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
