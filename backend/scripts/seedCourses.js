const { prisma } = require('../src/config/db');
const { generateLessonsForCourse } = require('../src/utils/aiGenerator');

async function seed() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.log("No admin found");
    return;
  }

  const courses = [
    { title: "Advanced React Patterns", category: "Web Development", level: "Advanced", desc: "Master advanced React.js patterns and performance optimizations." },
    { title: "Data Structures in Java", category: "DSA", level: "Intermediate", desc: "Comprehensive guide to DSA using Java." },
    { title: "UI/UX Design Systems", category: "Design", level: "Beginner", desc: "Learn to build scalable design systems from scratch." },
    { title: "Cloud & DevOps Essentials", category: "DevOps", level: "Beginner", desc: "Introduction to AWS, Docker, and CI/CD pipelines." },
    { title: "Rust for Systems Programming", category: "Programming Languages", level: "Advanced", desc: "Deep dive into Rust concepts like memory safety and concurrency." }
  ];

  for (const c of courses) {
    console.log("Generating course:", c.title);
    const course = await prisma.course.create({
      data: {
        title: c.title,
        description: c.desc,
        category: c.category,
        level: c.level,
        thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
        celebrityTeacher: "Salman Khan",
        price: 499,
        duration: "Self-paced",
        rating: 4.8,
        status: "approved",
        instructorId: admin.id
      }
    });

    const lessonsData = await generateLessonsForCourse(c.title, c.category, c.level);
    let order = 1;
    for (const l of lessonsData) {
      await prisma.lesson.create({
        data: {
          title: l.title || "Lesson",
          content: l.content || "Lesson content",
          videoUrl: l.videoUrl || "",
          order: order++,
          courseId: course.id
        }
      });
    }
    await prisma.course.update({
      where: { id: course.id },
      data: { duration: `${lessonsData.length * 20} Mins` }
    });
    console.log(`Created course: ${c.title} with ${lessonsData.length} lessons`);
  }
  console.log("All courses generated.");
  process.exit(0);
}

seed().catch(console.error);
