/**
 * Clear Redis cache (cars, categories, etc.)
 * Run: node scripts/clear-cache.js
 */
require('dotenv').config();
const { createClient } = require('redis');

async function clearCache() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
        console.error('REDIS_URL not set');
        process.exit(1);
    }
    let url = redisUrl;
    if (url.includes('upstash') && url.startsWith('redis://')) {
        url = url.replace('redis://', 'rediss://');
    }
    const client = createClient({
        url,
        socket: { tls: url.startsWith('rediss://') },
    });
    try {
        await client.connect();
        const carKeys = await client.keys('driveease:cars:*');
        const cacheKeys = await client.keys('driveease:cache:*');
        const allKeys = [...carKeys, ...cacheKeys];
        if (allKeys.length > 0) {
            await client.del(allKeys);
            console.log('✅ Cache cleared:', allKeys.length, 'keys removed');
        } else {
            console.log('No cache keys found');
        }
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    } finally {
        await client.quit();
    }
}
clearCache();
