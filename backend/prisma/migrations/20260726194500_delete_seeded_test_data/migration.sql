-- Production cleanup: remove legacy seeded instructors, courses, and test accounts.
DELETE FROM "Course"
WHERE "celebrityTeacher" IN ('Salman Khan', 'Virat Kohli', 'Sachin Tendulkar', 'Anushka Sharma', 'Katrina Kaif')
   OR "instructorId" IN (SELECT "id" FROM "User" WHERE LOWER("email") LIKE '%@instructor.com');

DELETE FROM "User"
WHERE LOWER("email") IN (
  'rohan.iyer@instructor.com', 'priya.sharma@instructor.com', 'aarav.mehta@instructor.com',
  'deojoh@gmail.com', 'admin.amit@lms.com'
) OR LOWER("email") LIKE '%@instructor.com'
  OR LOWER("email") LIKE '%@test.com'
  OR LOWER("email") LIKE '%@example.com';
