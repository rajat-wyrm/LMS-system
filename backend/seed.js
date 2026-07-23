const bcrypt = require('bcryptjs');
const { prisma, connectDB } = require('./src/config/db');

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...');

    // 1. Create admin user
    const email = 'shubham3@gmail.com';
    const password = 'shubham123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'admin',
        name: 'Shubham Admin',
        status: 'approved'
      },
      create: {
        name: 'Shubham Admin',
        email: email,
        password: hashedPassword,
        role: 'admin',
        status: 'approved'
      }
    });
    console.log('Admin account created/updated!');

    // 2. Create mock courses
    const courses = [
      {
        title: 'Complete Python Bootcamp',
        description: 'Learn Python like a Professional. Start from the basics and go all the way to creating your own applications and games.',
        category: 'Python',
        level: 'Beginner',
        price: 29.99,
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        celebrityTeacher: 'Virat Kohli',
        status: 'approved',
        instructorId: admin.id,
      },
      {
        title: 'Advanced CSS Layouts & Grid',
        description: 'Master Flexbox, CSS Grid, animations, responsive design, and modern layout techniques to build gorgeous websites.',
        category: 'CSS',
        level: 'Advanced',
        price: 19.99,
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80',
        celebrityTeacher: 'Salman Khan',
        status: 'approved',
        instructorId: admin.id,
      },
      {
        title: 'MERN Stack Masterclass',
        description: 'Build complete fullstack web applications using MongoDB, Express, React, and Node.js. Includes authentication and state management.',
        category: 'MERN Stack',
        level: 'Intermediate',
        price: 49.99,
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
        celebrityTeacher: 'Narendra Modi',
        status: 'approved',
        instructorId: admin.id,
      },
      {
        title: 'AI & Machine Learning Foundations',
        description: 'Understand the math and logic behind Neural Networks, Deep Learning, Regression, Classification, and implement them in code.',
        category: 'AI & Machine Learning',
        level: 'Beginner',
        price: 0,
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
        celebrityTeacher: 'Sachin Tendulkar',
        status: 'approved',
        instructorId: admin.id,
      },
      {
        title: 'Data Science with Python',
        description: 'Analyze data, build predictive models, visualize insights, and use popular libraries like Pandas, NumPy, and Scikit-Learn.',
        category: 'Data Science',
        level: 'Intermediate',
        price: 39.99,
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
        celebrityTeacher: 'Hardik Pandya',
        status: 'approved',
        instructorId: admin.id,
      }
    ];

    for (const c of courses) {
      const createdCourse = await prisma.course.create({
        data: {
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          price: c.price,
          thumbnail: c.thumbnail,
          celebrityTeacher: c.celebrityTeacher,
          status: c.status,
          instructorId: c.instructorId,
        }
      });

      // Add a couple of mock lessons to each course
      await prisma.lesson.createMany({
        data: [
          {
            title: 'Welcome & Introduction',
            content: `Overview of the course modules, requirements, and what you will learn in this ${c.level} syllabus.`,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            order: 1,
            courseId: createdCourse.id,
          },
          {
            title: 'Getting Started: The First Project',
            content: 'Set up your local workspace, tools, and build your very first hands-on project to run in real time.',
            videoUrl: 'https://www.w3schools.com/html/movie.mp4',
            order: 2,
            courseId: createdCourse.id,
          }
        ]
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
