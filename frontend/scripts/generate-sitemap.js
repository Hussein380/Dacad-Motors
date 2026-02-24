/**
 * Sitemap Generator Script
 * Runs before `vite build` to generate a fresh, complete sitemap.xml
 * using ALL cars currently in the database (via the live API).
 * 
 * Usage: node scripts/generate-sitemap.js
 * Configured as the "prebuild" step in package.json.
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = 'https://dacadmotors.com';
const API_URL = process.env.VITE_API_URL || 'https://dacad-motors.vercel.app/api';

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error(`Failed to parse response from ${url}`)); }
            });
        }).on('error', reject);
    });
}

async function generateSitemap() {
    console.log('🗺️  Generating sitemap...');

    const staticPages = [
        { url: '/', changefreq: 'daily', priority: '1.0' },
        { url: '/cars', changefreq: 'daily', priority: '0.9' },
    ];

    let carEntries = [];

    try {
        const response = await fetchJSON(`${API_URL}/cars?limit=1000&available=true`);
        const cars = response?.data?.cars || [];
        console.log(`   Found ${cars.length} cars to include.`);
        carEntries = cars.map(car => ({
            id: car._id || car.id,
            updatedAt: car.updatedAt,
        }));
    } catch (err) {
        console.warn(`   ⚠️  Could not fetch cars (${err.message}). Sitemap will only include static pages.`);
    }

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    carEntries.forEach(car => {
        const lastMod = car.updatedAt ? new Date(car.updatedAt).toISOString().split('T')[0] : today;
        xml += `
  <url>
    <loc>${BASE_URL}/cars/${car.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n</urlset>\n';

    const outputPath = path.join(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, xml, 'utf-8');
    console.log(`✅ Sitemap written to public/sitemap.xml with ${staticPages.length + carEntries.length} URLs.`);
}

generateSitemap().catch(err => {
    console.error('❌ Sitemap generation failed:', err.message);
    // Don't fail the build — a missing sitemap is not fatal
    process.exit(0);
});
