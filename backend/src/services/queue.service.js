const logger = require('../utils/logger');
const { sendEmailDirectly } = require('./email.service');

/**
 * Add an email job to the queue (or send directly on Vercel)
 * On Vercel: sends immediately (no BullMQ worker in serverless)
 * @param {string} type - Email type ('welcome', 'booking-confirmation')
 * @param {object} data - Data for the email template
 */
const addEmailJob = async (type, data) => {
    // Vercel serverless: no BullMQ worker, send directly
    if (process.env.VERCEL) {
        return sendEmailDirectly(type, data);
    }
    try {
        const { emailQueue } = require('../config/queue.config');
        const job = await emailQueue.add(type, { type, data }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });
        logger.info(`Email job added: ${type} (Job ID: ${job.id})`);
        return job;
    } catch (error) {
        logger.error(`Failed to add email job: ${error.message}`);
        return null;
    }
};

module.exports = {
    addEmailJob,
};
