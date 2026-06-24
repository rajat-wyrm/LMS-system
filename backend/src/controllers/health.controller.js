const { prisma } = require('../config/db');
const redisClient = require('../services/redis.service');

const getSystemHealth = async (req, res) => {
  let database = 'DOWN';
  let redisStatus = 'DOWN';

  try {
    await prisma.$queryRaw`SELECT 1`;
    database = 'UP';
  } catch (error) {
    console.error('DB Health Check Failed:', error.message);
  }

  try {
    const pong = await redisClient.ping();

    if (pong === 'PONG') {
      redisStatus = 'UP';
    }
  } catch (error) {
    console.error('Redis Health Check Failed:', error.message);
  }

  res.status(200).json({
    status:
      database === 'UP' && redisStatus === 'UP'
        ? 'HEALTHY'
        : 'DEGRADED',
    database,
    redis: redisStatus,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  getSystemHealth
};