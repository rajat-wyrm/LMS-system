require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { readReplicas } = require('@prisma/extension-read-replicas');
const logger = require('../utils/logger');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Base prisma client
const basePrisma = new PrismaClient({ 
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Extend prisma client with read replicas ONLY if a replica URL is provided
// const prisma = process.env.DATABASE_URL_REPLICA
//   ? basePrisma.$extends(
//       readReplicas({
//         replicas: [
//           {
//             connectionString: process.env.DATABASE_URL_REPLICA,
//           },
//         ],
//       })
//     )
//   : basePrisma;
const prisma = basePrisma;


const connectDB = async () => {
  try {
    await basePrisma.$connect();
    logger.info('PostgreSQL Primary Connected via Prisma');
    // Read replicas are connected on-demand by the extension, but we log readiness
    logger.info(`Database Read-Replica Ready: ${!!process.env.DATABASE_URL_REPLICA}`);
  } catch (error) {
    logger.error({ err: error }, 'Database connection error');
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
