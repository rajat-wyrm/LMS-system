require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { readReplicas } = require('@prisma/extension-read-replicas');
const logger = require('../utils/logger');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const basePrisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

const prisma = process.env.DATABASE_URL_REPLICA
  ? basePrisma.$extends(
      readReplicas({
        replicas: [
          new PrismaClient({
            adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_REPLICA }),
          }),
        ],
      })
    )
  : basePrisma;

const connectDB = async () => {
  try {
    await basePrisma.$connect();
    logger.info('PostgreSQL Primary Connected via Prisma');
    logger.info(`Database Read-Replica Ready: ${!!process.env.DATABASE_URL_REPLICA}`);
  } catch (error) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };