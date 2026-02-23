/**
 * Vercel Serverless Function for Dynamic Sitemap
 */
const mongoose = require('mongoose');

// Logic is similar to the backend controller but standalone for Vercel priority
module.exports = async (req, res) => {
    try {
        // Load environment
        require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

        // Connect to DB if not connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI);
        }

        const Car = mongoose.models.Car || mongoose.model('Car', new mongoose.Schema({
            available: Boolean,
            updatedAt: Date
        }));

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

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
        return res.status(200).send(xml);
    } catch (err) {
        console.error('Sitemap function error:', err);
        return res.status(500).send('Error generating sitemap');
    }
};
