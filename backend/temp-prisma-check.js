const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
(async () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] });
  try {
    await prisma.$connect();
    console.log('connected');
    const result = await prisma.$queryRaw`select current_user as u, current_database() as d`;
    console.log(result);
    const count = await prisma.user.count();
    console.log('user count', count);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
