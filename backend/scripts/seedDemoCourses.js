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

    // Find or create default demo instructor
    let instructor = await prisma.user.findFirst({
      where: { role: 'instructor' }
    });

    if (!instructor) {
      instructor = await prisma.user.findFirst({
        where: { role: 'admin' }
      });
    }

    if (!instructor) {
      instructor = await prisma.user.create({
        data: {
          name: 'Demo Course Instructor',
          email: 'demo.instructor@lms.local',
          password: 'hashed_demo_password_123',
          role: 'instructor',
          status: 'approved'
        }
      });
      console.log(` Created default instructor: ${instructor.email} (${instructor.id})`);
    }

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
    console.log(`\n[Database Notice] PostgreSQL persistence bypassed (${err.message}).`);
    console.log('Structured demo courses are available via backend/scripts/demoCoursesData.json for offline/mock environments.');
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

