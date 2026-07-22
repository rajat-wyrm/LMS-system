console.log(process.env.DATABASE_URL);
const { prisma } = require('./src/config/db');
(async () => {
  try {
    await prisma.$connect();
    console.log('db ok');
    const count = await prisma.user.count();
    console.log('count', count);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
