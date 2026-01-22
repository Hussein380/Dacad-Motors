const { Queue, Worker } = require('bullmq');
const logger = require('../utils/logger');

// Reuse our existing Redis connection config
let redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const isUpstash = redisUrl.includes('upstash.io');

// Upstash requires TLS
if (isUpstash && redisUrl.startsWith('redis://')) {
    redisUrl = redisUrl.replace('redis://', 'rediss://');
}

// Parse Redis URL for BullMQ connection options
const parseRedisUrl = (url) => {
    const parsed = new URL(url);
    return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 6379,
        username: parsed.username || undefined,
        password: parsed.password || undefined,
        tls: url.startsWith('rediss://') ? {} : undefined,
    };
};

const connection = parseRedisUrl(redisUrl);

// Email Queue
const emailQueue = new Queue('email', { connection });

logger.info('BullMQ Email Queue initialized');

module.exports = {
    emailQueue,
    connection,
};
