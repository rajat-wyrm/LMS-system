const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initScheduledCoursePublisher = () => {
  // Har 1 minute me check karega (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const result = await prisma.course.updateMany({
        where: {
          status: 'pending',
          publishAt: {
            lte: now, // Jab publishAt ka time current time se pehle ya barabar ho gaya ho
          },
        },
        data: {
          status: 'approved',
        },
      });

      if (result.count > 0) {
        console.log(`[Cron Job] Successfully published ${result.count} scheduled course(s).`);
      }
    } catch (error) {
      console.error('[Cron Job Error] Scheduled course publishing failed:', error);
    }
  });
};

module.exports = { initScheduledCoursePublisher };