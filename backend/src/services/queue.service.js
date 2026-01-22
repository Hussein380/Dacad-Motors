const { emailQueue } = require('../config/queue.config');
const logger = require('../utils/logger');

/**
 * Add an email job to the queue
 * @param {string} type - Email type ('welcome', 'booking-confirmation')
 * @param {object} data - Data for the email template
 */
const addEmailJob = async (type, data) => {
    try {
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
        // Non-blocking: log the error but don't crash the main flow
        logger.error(`Failed to add email job: ${error.message}`);
        return null;
    }
};

module.exports = {
    addEmailJob,
};
