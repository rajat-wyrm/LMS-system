require('dotenv').config();
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });

const prisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('SQLite Database Connected via Prisma');
  } catch (error) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
