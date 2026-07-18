const { prisma } = require('./src/config/db');

async function main() {
  const enrollments = await prisma.enrollment.findMany({
    select: { id: true, progress: true, status: true, certificateApproved: true }
  });
  console.log("All Enrollments:", enrollments);
}

main().finally(() => prisma.$disconnect());
