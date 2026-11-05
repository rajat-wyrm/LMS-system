/**
 * Demo Course Seeder for Issue #169: [Data] Demo Course Ingestion & RAG Mapping
 *
 * Seeds 3 demo courses and 15 associated lessons matching the canonical specification:
 * 1. Python Fundamentals (5 lessons)
 * 2. Machine Learning Foundations (5 lessons)
 * 3. Web Development (5 lessons)
 *
 * If a PostgreSQL database connection is available via Prisma, it creates/updates the
 * database records. If the database is offline or unconfigured, it validates the structured
 * course fixtures and outputs the verification status without failing.
 */

const fs = require('fs');
const path = require('path');

const DEMO_COURSES = require('./demoCoursesData.json');

async function seedDemoCourses() {
  console.log('--- Issue #169: Seeding Demo Courses ---');
  console.log(`Loaded ${DEMO_COURSES.length} demo course specifications.`);

  // Validate structural integrity of courses and lessons
  for (const course of DEMO_COURSES) {
    if (!course.id || !course.title || !Array.isArray(course.lessons) || course.lessons.length !== 5) {
      throw new Error(`Invalid course specification for: ${course.title || 'Unknown'}`);
    }
    console.log(` Verified: [${course.id}] "${course.title}" with ${course.lessons.length} lessons.`);
  }

  // Attempt database persistence via Prisma if available
  let prisma;
  try {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
    await prisma.$connect();
    console.log('Connected to PostgreSQL database via Prisma.');

    // Look for an existing suitable instructor or admin account
    let instructor = await prisma.user.findFirst({
      where: { role: 'instructor' }
    });

    if (!instructor) {
      instructor = await prisma.user.findFirst({
        where: { role: 'admin' }
      });
    }

    if (!instructor) {
      // Do not silently create an account with a hardcoded plain text password.
      // Report the requirement clearly so a secure administrator or instructor is configured.
      throw new Error(
        'No existing instructor or admin account found in database. ' +
        'Please create an instructor account via createAdmin.js or signup before seeding demo courses.'
      );
    }
    console.log(`Using existing account: ${instructor.email} (${instructor.role}) for demo courses.`);

    for (const c of DEMO_COURSES) {
      const courseRecord = await prisma.course.upsert({
        where: { id: c.id },
        update: {
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          status: c.status,
          price: c.price,
          rating: c.rating,
          duration: c.duration,
          outcomes: c.outcomes,
          instructorId: instructor.id
        },
        create: {
          id: c.id,
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          status: c.status,
          price: c.price,
          rating: c.rating,
          duration: c.duration,
          outcomes: c.outcomes,
          instructorId: instructor.id
        }
      });

      console.log(` Upserted course: [${courseRecord.id}] ${courseRecord.title}`);

      for (const lesson of c.lessons) {
        await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            courseId: courseRecord.id
          },
          create: {
            id: lesson.id,
            title: lesson.title,
            content: lesson.content,
            order: lesson.order,
            courseId: courseRecord.id
          }
        });
      }
      console.log(`   Upserted ${c.lessons.length} lessons for ${courseRecord.title}`);
    }

    console.log(' Successfully persisted all demo courses and lessons to PostgreSQL.');
  } catch (err) {
    console.error(`\n[Database Error / Notice] PostgreSQL persistence failed: ${err.message}`);
    // If running in strict production or database mode, propagate error
    if (process.env.STRICT_DB === 'true' || process.env.NODE_ENV === 'production') {
      throw err;
    }
    console.log('[Notice] Running in offline / mock mode: Structured demo courses are available via demoCoursesData.json.');
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }

  return DEMO_COURSES;
}

if (require.main === module) {
  seedDemoCourses()
    .then(() => {
      console.log('Demo course seeding process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seedDemoCourses, DEMO_COURSES };

