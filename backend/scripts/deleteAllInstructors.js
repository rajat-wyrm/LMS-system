const { prisma } = require('../src/config/db');

async function main() {
  const before = await prisma.user.count({ where: { role: 'instructor' } });
  const deleted = await prisma.user.deleteMany({ where: { role: 'instructor' } });
  const after = await prisma.user.count({ where: { role: 'instructor' } });

  console.log(JSON.stringify({ before, deleted: deleted.count, after }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
