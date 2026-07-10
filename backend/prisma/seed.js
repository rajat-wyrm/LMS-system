const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/db');

const img = (seed) => `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=80`;

const seedAdmin = {
  name: "Amit Sharma",
  email: "admin.amit@lms.com",
  role: "admin",
  status: "approved"
};

const seedCourses = [
  {
    slug: "real-world-ai-agents",
    title: "Real World Projects on AI Agents",
    instructorName: "Aarav Mehta",
    duration: "5 Hrs",
    lessons: 5,
    rating: 4.7,
    level: "Beginner",
    thumbnail: img("photo-1677442136019-21780ecad995"),
    category: "AI",
    description: "Build production-grade AI agents from scratch using LangChain, LangGraph and modern LLM tooling. Hands-on projects across automation, research and customer support.",
    outcomes: ["Design multi-step agent workflows", "Integrate tools and external APIs", "Evaluate and debug agent reasoning", "Deploy agents to production"],
    price: 499,
    xp: "1500 XP",
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
    icon: "🤖",
    status: "approved"
  },
  {
    slug: "genai-for-everyone",
    title: "Generative AI for Everyone",
    instructorName: "Priya Sharma",
    duration: "8 Hrs",
    lessons: 12,
    rating: 4.8,
    level: "Beginner",
    thumbnail: img("photo-1620712943543-bcc4688e7485"),
    category: "GenAI",
    description: "An accessible journey through generative AI: text, images, audio and video models.",
    outcomes: ["Understand transformer basics", "Use ChatGPT effectively", "Generate images with diffusion", "Fine-tune small models"],
    price: 399,
    xp: "2500 XP",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    icon: "🧠",
    status: "approved"
  },
  {
    slug: "data-science-bootcamp",
    title: "Data Science Bootcamp",
    instructorName: "Rohan Iyer",
    duration: "40 Hrs",
    lessons: 60,
    rating: 4.9,
    level: "Intermediate",
    thumbnail: img("photo-1551288049-bebda4e38f71"),
    category: "Data Science",
    description: "End-to-end data science: Python, statistics, ML, visualization, and capstone projects.",
    outcomes: ["Master pandas & numpy", "Build ML models", "Create dashboards", "Ship a portfolio project"],
    price: 799,
    xp: "3000 XP",
    gradient: "from-emerald-500 via-teal-500 to-green-400",
    icon: "📊",
    status: "approved"
  },
  {
    slug: "full-stack-web",
    title: "Full Stack Web Development",
    instructorName: "Neha Kapoor",
    duration: "60 Hrs",
    lessons: 85,
    rating: 4.6,
    level: "Intermediate",
    thumbnail: img("photo-1517180102446-f3ece451e9d8"),
    category: "Web Dev",
    description: "Build full stack apps with React, Node, Express and PostgreSQL.",
    outcomes: ["React & TypeScript", "REST + GraphQL APIs", "Auth & databases", "Deploy to cloud"],
    price: 599,
    xp: "4000 XP",
    gradient: "from-purple-600 via-violet-500 to-pink-500",
    icon: "💻",
    status: "approved"
  },
  {
    slug: "deep-learning-spec",
    title: "Deep Learning Specialization",
    instructorName: "Karan Verma",
    duration: "30 Hrs",
    lessons: 45,
    rating: 4.9,
    level: "Advanced",
    thumbnail: img("photo-1488229297570-58520851e868"),
    category: "AI",
    description: "Master deep learning: CNNs, RNNs, transformers and modern architectures.",
    outcomes: ["Train CNNs", "Build transformers", "Fine-tune LLMs", "Optimize inference"],
    price: 899,
    xp: "3500 XP",
    gradient: "from-indigo-600 via-purple-600 to-blue-500",
    icon: "🧠",
    status: "approved"
  },
  {
    slug: "cloud-aws",
    title: "Cloud Computing with AWS",
    instructorName: "Sneha Reddy",
    duration: "20 Hrs",
    lessons: 30,
    rating: 4.5,
    level: "Intermediate",
    thumbnail: img("photo-1451187580459-43490279c0fa"),
    category: "Cloud",
    description: "Deploy and scale applications on AWS with EC2, S3, Lambda and more.",
    outcomes: ["Architect cloud apps", "IAM & security", "Serverless basics", "CI/CD pipelines"],
    price: 549,
    xp: "2000 XP",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    icon: "☁️",
    status: "approved"
  },
  {
    slug: "python-data",
    title: "Python for Data Analysis",
    instructorName: "Vikram Singh",
    duration: "12 Hrs",
    lessons: 20,
    rating: 4.7,
    level: "Beginner",
    thumbnail: img("photo-1526379095098-d400fd0bf935"),
    category: "Data Science",
    description: "Use Python for serious data analysis with pandas, numpy and matplotlib.",
    outcomes: ["Pandas mastery", "Data cleaning", "Visualization", "Statistical analysis"],
    price: 349,
    xp: "1000 XP",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    icon: "🐍",
    status: "approved"
  },
  {
    slug: "ml-az",
    title: "Machine Learning A-Z",
    instructorName: "Ananya Desai",
    duration: "25 Hrs",
    lessons: 40,
    rating: 4.8,
    level: "Intermediate",
    thumbnail: img("photo-1555949963-aa79dcee981c"),
    category: "AI",
    description: "Comprehensive ML course covering all major algorithms with Python and R.",
    outcomes: ["Regression", "Classification", "Clustering", "Reinforcement learning"],
    price: 699,
    xp: "2800 XP",
    gradient: "from-slate-600 via-slate-500 to-gray-400",
    icon: "⚙️",
    status: "approved"
  },
  {
    slug: "mlops-prod",
    title: "MLOps & Production AI",
    instructorName: "Devan Kumar",
    duration: "18 Hrs",
    lessons: 28,
    rating: 4.6,
    level: "Advanced",
    thumbnail: img("photo-1518770660439-4636190af475"),
    category: "MLOps",
    description: "Productionize ML models with MLOps best practices, CI/CD and monitoring.",
    outcomes: ["Model versioning", "CI/CD for ML", "Monitoring", "A/B testing"],
    price: 799,
    xp: "3200 XP",
    gradient: "from-gray-700 via-gray-800 to-black",
    icon: "🚀",
    status: "approved"
  }
];

const seedLearningPaths = [
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    description: "From Python basics to deploying AI agents in production.",
    duration: "6 months",
    color: "orange",
    courseSlugs: ["python-data", "ml-az", "real-world-ai-agents", "mlops-prod"]
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    description: "Master data analysis, ML, and visualization end-to-end.",
    duration: "8 months",
    color: "teal",
    courseSlugs: ["python-data", "data-science-bootcamp", "ml-az", "deep-learning-spec"]
  },
  {
    slug: "fullstack",
    title: "Full Stack Developer",
    description: "Build modern web apps from frontend to deployment.",
    duration: "5 months",
    color: "orange",
    courseSlugs: ["full-stack-web", "cloud-aws"]
  },
  {
    slug: "genai",
    title: "Generative AI Specialist",
    description: "Become an expert in generative AI models & applications.",
    duration: "4 months",
    color: "teal",
    courseSlugs: ["genai-for-everyone", "deep-learning-spec", "real-world-ai-agents"]
  }
];

async function main() {
  console.log('Seeding database...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create default admin user
  console.log('Upserting admin user...');
  await prisma.user.upsert({
    where: { email: seedAdmin.email },
    update: {
      name: seedAdmin.name,
      password: hashedPassword,
      role: seedAdmin.role,
      status: seedAdmin.status
    },
    create: {
      name: seedAdmin.name,
      email: seedAdmin.email,
      password: hashedPassword,
      role: seedAdmin.role,
      status: seedAdmin.status
    }
  });

  // 1. Create Instructors
  const instructors = {};
  for (const c of seedCourses) {
    if (!instructors[c.instructorName]) {
      const email = `${c.instructorName.toLowerCase().replace(' ', '.')}@instructor.com`;
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: c.instructorName,
            email,
            password: hashedPassword,
            role: 'instructor',
            status: 'approved'
          }
        });
      }
      instructors[c.instructorName] = user;
    }
  }

  // 2. Create Courses
  const dbCourses = {};
  for (const c of seedCourses) {
    let course = await prisma.course.findFirst({ where: { title: c.title } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          title: c.title,
          description: c.description,
          category: c.category,
          level: c.level,
          price: c.price,
          thumbnail: c.thumbnail,
          duration: c.duration,
          rating: c.rating,
          outcomes: c.outcomes,
          xp: c.xp,
          gradient: c.gradient,
          icon: c.icon,
          status: c.status,
          instructorId: instructors[c.instructorName].id,
          celebrityTeacher: c.instructorName
        }
      });
    }
    dbCourses[c.slug] = course;
  }

  // 3. Create Learning Paths
  for (const lp of seedLearningPaths) {
    let path = await prisma.learningPath.findUnique({ where: { slug: lp.slug } });
    if (!path) {
      path = await prisma.learningPath.create({
        data: {
          slug: lp.slug,
          title: lp.title,
          description: lp.description,
          duration: lp.duration,
          color: lp.color,
          courses: {
            connect: lp.courseSlugs.map(s => ({ id: dbCourses[s].id }))
          }
        }
      });
    }
  }

  console.log('Database seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
