const logger = require('../utils/logger');

// Mock queue for testing without Redis
const emailQueue = {};

const addEmailJob = async (emailData) => {
  logger.info(`[EmailQueue MOCK] Job added: email to ${emailData.to}`);
  return { id: 'mock-job-' + Date.now() };
};

module.exports = { emailQueue, addEmailJob };
