const { Worker } = require('bullmq');
const logger = require('../utils/logger');

const redisClient = require('../services/redis.service');

// This simulates an email sending service (e.g. Nodemailer/SendGrid)
const mockSendEmail = async ({ to, subject, body }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info({ to, subject, body }, '[EMAIL SENT]');
      resolve(true);
    }, 2000); // simulate 2-second network latency
  });
};

const emailWorker = new Worker('email-queue', async (job) => {
  logger.info(`[EmailWorker] Processing job ${job.id} for ${job.data.to}`);
  
  // Actually "send" the email
  await mockSendEmail(job.data);
  
  return { delivered: true };
}, { connection: redisClient });

emailWorker.on('completed', (job) => {
  logger.info(`[EmailWorker] Job ${job.id} completed successfully.`);
});

emailWorker.on('failed', (job, err) => {
  logger.error({ err }, `[EmailWorker] Job ${job.id} failed`);
});

module.exports = emailWorker;
