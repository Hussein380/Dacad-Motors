const { client } = require('../config/redis.config');

/**
 * Middleware to cache GET requests
 * @param {Number} ttl - Time to live in seconds (default 1 hour)
 */
const cache = (ttl = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // If Redis isn't connected, skip caching
        if (!client.isOpen) {
            return next();
        }

        const key = `driveease:cache:${req.originalUrl}`;

        try {
            const cachedData = await client.get(key);
            if (cachedData) {
                // Return cached response directly (it's already the full JSON response)
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).send(cachedData);
            }

            // Cache miss - intercept the response to store it
            res.setHeader('X-Cache', 'MISS');
            
            const originalSend = res.send;
            res.send = function (body) {
                res.send = originalSend;

                // Store in cache if it's a success status
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    client.setEx(key, ttl, body).catch(err => console.error('Cache set error:', err));
                }

                return originalSend.call(this, body);
            };

            next();
        } catch (err) {
            console.error('Cache middleware error:', err);
            next();
        }
    };
};

module.exports = cache;
