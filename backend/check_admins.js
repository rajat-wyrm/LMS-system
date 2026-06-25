const { prisma } = require('./src/config/db');

async function checkAdmins() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, name: true, email: true, status: true, role: true }
    });
    console.log('Admin users in DB:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
