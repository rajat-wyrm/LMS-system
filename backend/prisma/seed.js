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
    slug: "full-stack-web",
    title: "Full Stack Web Development",
    instructorName: "Neha Kapoor",
    duration: "60 Hrs",
    rating: 4.8,
    level: "Intermediate",
    thumbnail: img("photo-1517180102446-f3ece451e9d8"),
    category: "Web Dev",
    description: "Master modern full stack web application development from scratch using React, Node.js, Express, and PostgreSQL with Prisma ORM.",
    outcomes: ["Build scalable React frontends", "Design RESTful APIs with Express", "Database modeling with Prisma & PostgreSQL", "Deploy applications to production cloud hosts"],
    price: 599,
    xp: "4000 XP",
    gradient: "from-purple-600 via-violet-500 to-pink-500",
    icon: "💻",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "Introduction to Web Architecture & HTML5/CSS3",
        content: "Overview of front-end vs back-end development, HTTP client-server model, semantic HTML markup, modern CSS flexbox & grid layouts.",
        videoUrl: "https://www.youtube.com/watch?v=nu_pCVPKzTk"
      },
      {
        order: 2,
        title: "JavaScript ES6+ & Asynchronous Programming",
        content: "Deep dive into modern JS features, arrow functions, promises, async/await, closures, and fetch API for asynchronous data fetching.",
        videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk"
      },
      {
        order: 3,
        title: "Building Interactive UIs with React",
        content: "Component design patterns, state management with hooks (useState, useEffect), props, and single-page routing with React Router.",
        videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8"
      },
      {
        order: 4,
        title: "RESTful Backend APIs with Express & Node.js",
        content: "Setting up Node server, building Express routing, middleware implementation, error handling, and request validation with Zod.",
        videoUrl: "https://www.youtube.com/watch?v=l8WPWK9mS5M"
      },
      {
        order: 5,
        title: "Database Integration & Production Deployment",
        content: "Connecting Node backend to PostgreSQL with Prisma ORM, user authentication with JWT, and deploying full stack apps to cloud infrastructure.",
        videoUrl: "https://www.youtube.com/watch?v=71wSzpLyWJU"
      }
    ]
  },
  {
    slug: "dsa-mastery",
    title: "Data Structures & Algorithms",
    instructorName: "Rohan Iyer",
    duration: "45 Hrs",
    rating: 4.9,
    level: "Intermediate",
    thumbnail: img("photo-1551288049-bebda4e38f71"),
    category: "Computer Science",
    description: "Master fundamental data structures and algorithmic problem-solving techniques essential for coding interviews and high-performance software development.",
    outcomes: ["Analyze time & space complexity", "Implement linear and non-linear data structures", "Solve graph and dynamic programming problems", "Excel in technical coding interviews"],
    price: 649,
    xp: "3500 XP",
    gradient: "from-blue-600 via-indigo-500 to-purple-600",
    icon: "⚡",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "Time & Space Complexity (Big O Notation)",
        content: "Analyzing algorithm performance using Big O, Big Omega, and Big Theta notations. Evaluating space complexity and optimization trade-offs.",
        videoUrl: "https://www.youtube.com/watch?v=g2o22C3CRfU"
      },
      {
        order: 2,
        title: "Arrays, Strings & Linked Lists",
        content: "Memory layouts, two-pointer techniques, sliding window patterns, singly and doubly linked list manipulation.",
        videoUrl: "https://www.youtube.com/watch?v=njTh_OwMljA"
      },
      {
        order: 3,
        title: "Stacks, Queues & Hash Tables",
        content: "LIFO and FIFO operations, collision resolution techniques in hash tables, hash functions, and real-world applications.",
        videoUrl: "https://www.youtube.com/watch?v=knV86FlSXJ8"
      },
      {
        order: 4,
        title: "Trees, Binary Search Trees & Heaps",
        content: "Tree traversals (Inorder, Preorder, Postorder), BST searching and insertion, min-heaps, max-heaps, and priority queues.",
        videoUrl: "https://www.youtube.com/watch?v=fAAZixBzVSc"
      },
      {
        order: 5,
        title: "Graph Algorithms & Dynamic Programming",
        content: "Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's algorithm, memoization, and tabulating DP problems.",
        videoUrl: "https://www.youtube.com/watch?v=tWVWeAqZ0WU"
      }
    ]
  },
  {
    slug: "python-programming",
    title: "Python Programming Fundamentals",
    instructorName: "Vikram Singh",
    duration: "25 Hrs",
    rating: 4.7,
    level: "Beginner",
    thumbnail: img("photo-1526379095098-d400fd0bf935"),
    category: "Programming",
    description: "Learn Python from the ground up: syntax, object-oriented concepts, file handling, error management, and ecosystem packages.",
    outcomes: ["Write clean & idiomatic Python 3 code", "Understand Object-Oriented Programming principles", "Handle files and external APIs", "Leverage virtual environments and pip"],
    price: 349,
    xp: "1500 XP",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    icon: "🐍",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "Python Environment Setup & Basic Syntax",
        content: "Installing Python, using virtual environments, variables, data types, standard input/output, and basic arithmetic operations.",
        videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc"
      },
      {
        order: 2,
        title: "Control Flow & Built-in Data Structures",
        content: "Conditionals, loops (for, while), lists, dictionaries, tuples, sets, and list comprehensions.",
        videoUrl: "https://www.youtube.com/watch?v=k9TUPpGqYTo"
      },
      {
        order: 3,
        title: "Functions, Modules & Scope",
        content: "Defining functions, positional & keyword arguments, args/kwargs, lambda functions, scope, and importing Python standard modules.",
        videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I"
      },
      {
        order: 4,
        title: "Object-Oriented Programming (OOP) in Python",
        content: "Classes, objects, constructor method (__init__), instance vs class attributes, encapsulation, inheritance, and polymorphism.",
        videoUrl: "https://www.youtube.com/watch?v=JeznW_7DlB0"
      },
      {
        order: 5,
        title: "File I/O, Error Handling & External Packages",
        content: "Reading and writing text/JSON files, try-except blocks, raising custom exceptions, and installing third-party packages via pip.",
        videoUrl: "https://www.youtube.com/watch?v=HGOBQPFzWKo"
      }
    ]
  },
  {
    slug: "ml-fundamentals",
    title: "Machine Learning Fundamentals",
    instructorName: "Ananya Desai",
    duration: "35 Hrs",
    rating: 4.8,
    level: "Intermediate",
    thumbnail: img("photo-1555949963-aa79dcee981c"),
    category: "AI",
    description: "A comprehensive guide to supervised and unsupervised machine learning algorithms, statistical model evaluation, and Python ML libraries.",
    outcomes: ["Understand core ML algorithms", "Perform exploratory data analysis with pandas", "Train regression and classification models", "Evaluate models using cross-validation"],
    price: 699,
    xp: "3000 XP",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    icon: "🤖",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "Introduction to Machine Learning Workflow",
        content: "Supervised vs unsupervised learning, machine learning lifecycle, split training/testing datasets, and loss functions.",
        videoUrl: "https://www.youtube.com/watch?v=Gv9_4yMHFhI"
      },
      {
        order: 2,
        title: "Data Preprocessing & Exploratory Analysis",
        content: "Data cleaning with pandas, handling missing values, feature scaling, one-hot encoding, and feature correlation analysis.",
        videoUrl: "https://www.youtube.com/watch?v=r-uOLxNrNk8"
      },
      {
        order: 3,
        title: "Regression Models: Linear & Polynomial",
        content: "Mathematical intuition behind linear regression, gradient descent optimization, cost function minimization, and evaluating RMSE.",
        videoUrl: "https://www.youtube.com/watch?v=nk2CQITm_eo"
      },
      {
        order: 4,
        title: "Classification: Logistic Regression & Decision Trees",
        content: "Binary and multi-class classification, decision boundary, entropy, information gain, random forests, and confusion matrix evaluation.",
        videoUrl: "https://www.youtube.com/watch?v=yIYKR4sgzI8"
      },
      {
        order: 5,
        title: "Model Evaluation & Hyperparameter Tuning",
        content: "Overfitting vs underfitting, bias-variance tradeoff, K-fold cross-validation, GridSearchCV, and saving models with joblib.",
        videoUrl: "https://www.youtube.com/watch?v=HdlDYng8g9s"
      }
    ]
  },
  {
    slug: "cloud-aws",
    title: "Cloud Computing with AWS",
    instructorName: "Sneha Reddy",
    duration: "20 Hrs",
    rating: 4.6,
    level: "Intermediate",
    thumbnail: img("photo-1451187580459-43490279c0fa"),
    category: "Cloud",
    description: "Architect, deploy, and scale robust applications on Amazon Web Services using EC2, S3, RDS, Lambda, and IAM security.",
    outcomes: ["Understand AWS global infrastructure", "Provision compute & storage resources", "Configure cloud networking & security", "Deploy serverless microservices"],
    price: 549,
    xp: "2000 XP",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    icon: "☁️",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "AWS Core Services & IAM Security",
        content: "Understanding cloud deployment models, AWS Global Infrastructure (Regions & AZs), IAM users, roles, groups, and security policies.",
        videoUrl: "https://www.youtube.com/watch?v=ulprqHHWlng"
      },
      {
        order: 2,
        title: "Virtual Servers with Amazon EC2",
        content: "Launching Linux EC2 instances, key pairs, security groups, EBS volume attachment, and SSH access.",
        videoUrl: "https://www.youtube.com/watch?v=i1xT2w4P1k4"
      },
      {
        order: 3,
        title: "Object Storage with Amazon S3 & CloudFront",
        content: "Creating S3 buckets, bucket policies, lifecycle rules, static website hosting, and global content delivery via CloudFront.",
        videoUrl: "https://www.youtube.com/watch?v=e6w9LwZJFBU"
      },
      {
        order: 4,
        title: "Managed Databases: Amazon RDS & DynamoDB",
        content: "Provisioning relational databases with Amazon RDS (PostgreSQL/MySQL), multi-AZ deployment, and NoSQL modeling with DynamoDB.",
        videoUrl: "https://www.youtube.com/watch?v=3R-zZ_N5m6w"
      },
      {
        order: 5,
        title: "Serverless Compute with AWS Lambda & API Gateway",
        content: "Building event-driven microservices using AWS Lambda functions, configuring REST API routes in API Gateway, and monitoring with CloudWatch.",
        videoUrl: "https://www.youtube.com/watch?v=7T5456OgEN0"
      }
    ]
  },
  {
    slug: "sql-database-design",
    title: "SQL & Database Design",
    instructorName: "Amit Sharma",
    duration: "18 Hrs",
    rating: 4.7,
    level: "Beginner",
    thumbnail: img("photo-1544383835-bda2bc66a55d"),
    category: "Database",
    description: "Design relational database schemas from scratch, master SQL queries, joins, subqueries, indexing, transactions, and ACID principles.",
    outcomes: ["Design normalized ER database schemas", "Write complex SQL queries & joins", "Optimize queries with indexes", "Manage database transactions & ACID properties"],
    price: 399,
    xp: "1800 XP",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    icon: "🗄️",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "Relational Database Concepts & ER Diagrams",
        content: "Tables, columns, rows, primary keys, foreign keys, one-to-many, and many-to-many relationship modeling using Entity-Relationship Diagrams.",
        videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY"
      },
      {
        order: 2,
        title: "SQL Basics: SELECT, WHERE, & Filtering",
        content: "Writing SQL queries, filtering data with WHERE clauses, logical operators, LIKE pattern matching, and sorting output with ORDER BY.",
        videoUrl: "https://www.youtube.com/watch?v=27axs9d602A"
      },
      {
        order: 3,
        title: "Relational Joins & Data Aggregation",
        content: "Combining tables using INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, grouping data with GROUP BY, and applying HAVING filters.",
        videoUrl: "https://www.youtube.com/watch?v=0rB_P08pB04"
      },
      {
        order: 4,
        title: "Database Normalization & Indexing",
        content: "First Normal Form (1NF) through Third Normal Form (3NF), anomaly prevention, creating B-Tree indexes, and optimizing query execution plans.",
        videoUrl: "https://www.youtube.com/watch?v=GFQaEYEc8_8"
      },
      {
        order: 5,
        title: "Transactions, ACID Properties & Stored Procedures",
        content: "Database transactions (BEGIN, COMMIT, ROLLBACK), understanding Atomicity, Consistency, Isolation, Durability, and writing triggers.",
        videoUrl: "https://www.youtube.com/watch?v=5bFsJjQ8m-M"
      }
    ]
  },
  {
    slug: "reactjs-dev",
    title: "React.js Development",
    instructorName: "Aarav Mehta",
    duration: "30 Hrs",
    rating: 4.8,
    level: "Intermediate",
    thumbnail: img("photo-1633356122544-f134324a6cee"),
    category: "Web Dev",
    description: "Deep dive into building modern web applications with React 18, JSX, custom hooks, Redux Toolkit, form handling, and performance tuning.",
    outcomes: ["Understand Virtual DOM & JSX internals", "Manage complex state with Hooks & Redux Toolkit", "Validate forms with React Hook Form", "Optimize React app rendering performance"],
    price: 499,
    xp: "2500 XP",
    gradient: "from-sky-400 via-blue-500 to-indigo-600",
    icon: "⚛️",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "React Essentials & Virtual DOM",
        content: "Understanding the Virtual DOM, reconciliation algorithm, JSX syntax, functional components, and passing props.",
        videoUrl: "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
      },
      {
        order: 2,
        title: "State & Lifecycle Management with Hooks",
        content: "Managing local component state with useState, side effects and API requests with useEffect, and useRef for DOM references.",
        videoUrl: "https://www.youtube.com/watch?v=TNhaISOUy6Q"
      },
      {
        order: 3,
        title: "Form Handling, Validation & Custom Hooks",
        content: "Controlled vs uncontrolled inputs, form validation using React Hook Form, and abstracting reusable logic into custom React hooks.",
        videoUrl: "https://www.youtube.com/watch?v=tK4Vq2V2S0w"
      },
      {
        order: 4,
        title: "Global State Management with Redux Toolkit",
        content: "Centralized state store, slices, reducers, dispatching actions, handling async thunks for API calls, and Context API alternatives.",
        videoUrl: "https://www.youtube.com/watch?v=9zySeP5vH9c"
      },
      {
        order: 5,
        title: "React Performance & Next.js Overview",
        content: "Optimizing renders with React.memo, useMemo, useCallback, code splitting with React.lazy, and introduction to SSR/SSG with Next.js.",
        videoUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk"
      }
    ]
  },
  {
    slug: "system-design-basics",
    title: "System Design Basics",
    instructorName: "Karan Verma",
    duration: "28 Hrs",
    rating: 4.9,
    level: "Advanced",
    thumbnail: img("photo-1451187580459-43490279c0fa"),
    category: "Architecture",
    description: "Learn how to architect large-scale distributed systems, load balancing, caching, database sharding, message queues, and microservices.",
    outcomes: ["Design high-availability distributed systems", "Apply load balancing & caching strategies", "Implement database sharding & replication", "Architect microservices with async queues"],
    price: 799,
    xp: "3500 XP",
    gradient: "from-slate-700 via-gray-800 to-black",
    icon: "🏗️",
    status: "approved",
    lessonList: [
      {
        order: 1,
        title: "High-Level System Design & Scalability Principles",
        content: "Vertical vs horizontal scaling, latency vs throughput, availability vs consistency, and designing for high reliability.",
        videoUrl: "https://www.youtube.com/watch?v=i7twT3G4f4A"
      },
      {
        order: 2,
        title: "Load Balancing, API Gateways & Caching",
        content: "Load balancing algorithms (Round Robin, Least Connections), API Gateway capabilities, and distributed caching strategies with Redis.",
        videoUrl: "https://www.youtube.com/watch?v=K0Ta65OqQkY"
      },
      {
        order: 3,
        title: "Database Scaling: Sharding, Replication & CAP Theorem",
        content: "Read replicas, master-slave architecture, database sharding strategies, consistent hashing, and trade-offs defined by the CAP Theorem.",
        videoUrl: "https://www.youtube.com/watch?v=v3M0xlc8Mfo"
      },
      {
        order: 4,
        title: "Message Queues & Asynchronous Communication",
        content: "Decoupling services using message queues (RabbitMQ, Apache Kafka), publish-subscribe pattern, event-driven microservices architecture.",
        videoUrl: "https://www.youtube.com/watch?v=oGJk-V6Cu4E"
      },
      {
        order: 5,
        title: "Case Study: Designing a URL Shortener Service (TinyURL)",
        content: "Step-by-step walkthrough: calculating traffic & storage estimates, defining API contracts, database schema design, and hash key generation.",
        videoUrl: "https://www.youtube.com/watch?v=fMZMm_0ZhK4"
      }
    ]
  }
];

const seedLearningPaths = [
  {
    slug: "fullstack",
    title: "Full Stack Developer",
    description: "Build modern web apps from frontend to backend and deployment.",
    duration: "6 months",
    color: "orange",
    courseSlugs: ["full-stack-web", "reactjs-dev", "cloud-aws"]
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    description: "From Python basics to building machine learning models & architectures.",
    duration: "6 months",
    color: "teal",
    courseSlugs: ["python-programming", "ml-fundamentals", "system-design-basics"]
  },
  {
    slug: "data-scientist",
    title: "Data Scientist",
    description: "Master data analysis, SQL databases, and machine learning models.",
    duration: "8 months",
    color: "teal",
    courseSlugs: ["python-programming", "sql-database-design", "ml-fundamentals"]
  },
  {
    slug: "software-architect",
    title: "Software Architect",
    description: "Master algorithms, database systems, and distributed system design.",
    duration: "9 months",
    color: "orange",
    courseSlugs: ["dsa-mastery", "sql-database-design", "system-design-basics"]
  }
];

const seedStudents = [
  {
    name: "Aarav Patel",
    email: "aarav.patel@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Kabir Malhotra",
    email: "kabir.malhotra@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Diya Sen",
    email: "diya.sen@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Vivaan Joshi",
    email: "vivaan.joshi@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Isha Gupta",
    email: "isha.gupta@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Arjun Verma",
    email: "arjun.verma@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Riya Chakraborty",
    email: "riya.chakraborty@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Sai Teja",
    email: "sai.teja@example.com",
    role: "user",
    status: "approved"
  },
  {
    name: "Meera Nair",
    email: "meera.nair@example.com",
    role: "user",
    status: "approved"
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

  // Create student users
  console.log('Upserting student users...');
  for (const student of seedStudents) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {
        name: student.name,
        password: hashedPassword,
        role: student.role,
        status: student.status
      },
      create: {
        name: student.name,
        email: student.email,
        password: hashedPassword,
        role: student.role,
        status: student.status
      }
    });
  }

  // 1. Create Instructors
  console.log('Upserting instructor users...');
  const instructors = {};
  for (const c of seedCourses) {
    if (!instructors[c.instructorName]) {
      const email = `${c.instructorName.toLowerCase().replace(/ /g, '.')}@instructor.com`;
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

  // 2. Create Courses and Lessons
  console.log('Upserting courses and lessons...');
  const dbCourses = {};
  let totalLessonsSeeded = 0;

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
    } else {
      course = await prisma.course.update({
        where: { id: course.id },
        data: {
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

    // Seed 5 lessons per course idempotently
    if (c.lessonList && Array.isArray(c.lessonList)) {
      for (const lessonData of c.lessonList) {
        let lesson = await prisma.lesson.findFirst({
          where: {
            courseId: course.id,
            order: lessonData.order
          }
        });
        if (!lesson) {
          await prisma.lesson.create({
            data: {
              title: lessonData.title,
              content: lessonData.content,
              videoUrl: lessonData.videoUrl,
              order: lessonData.order,
              courseId: course.id
            }
          });
        } else {
          await prisma.lesson.update({
            where: { id: lesson.id },
            data: {
              title: lessonData.title,
              content: lessonData.content,
              videoUrl: lessonData.videoUrl
            }
          });
        }
        totalLessonsSeeded++;
      }
    }
  }

  console.log(`Seeded ${Object.keys(dbCourses).length} courses and ${totalLessonsSeeded} lessons successfully.`);

  // 3. Create Learning Paths
  console.log('Upserting learning paths...');
  for (const lp of seedLearningPaths) {
    let path = await prisma.learningPath.findUnique({ where: { slug: lp.slug } });
    const courseConnect = lp.courseSlugs
      .filter(s => dbCourses[s])
      .map(s => ({ id: dbCourses[s].id }));

    if (!path) {
      await prisma.learningPath.create({
        data: {
          slug: lp.slug,
          title: lp.title,
          description: lp.description,
          duration: lp.duration,
          color: lp.color,
          courses: {
            connect: courseConnect
          }
        }
      });
    } else {
      await prisma.learningPath.update({
        where: { id: path.id },
        data: {
          title: lp.title,
          description: lp.description,
          duration: lp.duration,
          color: lp.color,
          courses: {
            set: courseConnect
          }
        }
      });
    }
  }

  console.log('Database seed completed successfully.');
}

main()
  .catch(e => {
    console.error('Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
