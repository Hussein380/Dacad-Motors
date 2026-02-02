/**
 * Vercel serverless entry for Express backend.
 * Handles all /api/* requests.
 * Env vars: set in Vercel dashboard (or .env for local vercel dev)
 */
try {
    require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
} catch (_) {
    // dotenv optional (Vercel injects env at runtime)
}

const connectDB = require('../backend/src/config/database');
const app = require('../backend/src/app');

let dbPromise = null;

module.exports = async (req, res) => {
    if (!dbPromise) {
        dbPromise = connectDB().catch((err) => {
            console.error('DB connection failed:', err.message);
        });
    }
    await dbPromise;
    return app(req, res);
};
