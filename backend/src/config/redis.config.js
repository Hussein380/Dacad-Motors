const { createClient } = require('redis');

let redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isUpstash = redisUrl.includes('upstash.io');

// Strict check: if it's upstash or we want TLS, the protocol must be rediss://
if (isUpstash && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
}

const client = createClient({
    url: redisUrl,
    socket: {
        tls: redisUrl.startsWith('rediss://'),
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.log('Redis reached max retries. Caching disabled.');
                return false; // stop retrying
            }
            return Math.min(retries * 50, 2000);
        }
    }
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('Redis connected successfully');
});

// Connect immediately
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error('Initial Redis connection failed. Backend will run without caching.');
    }
})();

/**
 * Helper to clear all car-related cache
 */
const clearCarCache = async () => {
    try {
        if (!client.isOpen) return;
        // Clear both old and new cache key patterns
        const oldKeys = await client.keys('driveease:cars:*');
        const newKeys = await client.keys('driveease:cache:*');
        const allKeys = [...oldKeys, ...newKeys];
        if (allKeys.length > 0) {
            await client.del(allKeys);
            console.log(`Cache cleared: ${allKeys.length} keys removed`);
        }
    } catch (err) {
        console.error('Error clearing car cache:', err);
    }
};

module.exports = {
    client,
    clearCarCache
};
