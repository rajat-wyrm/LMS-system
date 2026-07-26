-- Remove old seeded/demo/test records so admin pages show only real database data.
-- Course rows are removed first because old demo courses may be attached to
-- seeded instructors or to a seeded admin account.

DELETE FROM "Course"
WHERE
  "title" IN (
    'Advanced React Patterns',
    'Python for Machine Learning',
    'Fullstack MERN Guide',
    'Data Structures in Java',
    'UI/UX Design Systems',
    'Mastering Next.js 14',
    'CSS & Tailwind Mastery',
    'Cloud & DevOps Essentials',
    'Full Stack Web Development',
    'Data Structures & Algorithms',
    'Test Delete',
    'Rust for Systems Programming'
  )
  OR "celebrityTeacher" IN (
    'Salman Khan',
    'Virat Kohli',
    'Sachin Tendulkar',
    'Anushka Sharma',
    'Katrina Kaif',
    'Neha Kapoor',
    'Rohan Iyer',
    'Vikram Singh',
    'Ananya Desai',
    'Sneha Reddy',
    'Amit Sharma',
    'Aarav Mehta',
    'Karan Verma'
  )
  OR "category" = 'Test'
  OR "thumbnail" LIKE 'https://images.unsplash.com/%';

DELETE FROM "User"
WHERE
  LOWER("email") IN (
    'admin.amit@lms.com',
    'john@gmail.com',
    'rohan.iyer@instructor.com',
    'priya.sharma@instructor.com',
    'aarav.mehta@instructor.com',
    'deojoh@gmail.com'
  )
  OR LOWER("email") LIKE '%@instructor.com'
  OR LOWER("email") LIKE '%@test.com'
  OR LOWER("email") LIKE '%@example.com'
  OR LOWER("email") LIKE 'smoke\_%' ESCAPE '\'
  OR LOWER("email") LIKE 'testuser\_%' ESCAPE '\'
  OR LOWER("email") LIKE 'inst\_%' ESCAPE '\'
  OR "name" IN (
    'Smoke Learner',
    'Test User',
    'Rohan Iyer',
    'Priya Sharma',
    'Aarav Mehta',
    'Amit Sharma',
    'Inst',
    'Salman Khan',
    'Virat Kohli',
    'Sachin Tendulkar',
    'Anushka Sharma',
    'Katrina Kaif',
    'Neha Kapoor',
    'Vikram Singh',
    'Ananya Desai',
    'Sneha Reddy',
    'Karan Verma'
  );
