require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const logger = require('../utils/logger');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Base prisma client
const basePrisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Read replicas are not required in development. The `@prisma/extension-read-replicas`
// extension is disabled here (it expects a `replicas: PrismaClient[]` array, not a
// connection string, and this project has no replica database to point it at).
const prisma = basePrisma;

const connectDB = async () => {
  try {
    await basePrisma.$connect();
    logger.info('PostgreSQL Primary Connected via Prisma');
  } catch (error) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
