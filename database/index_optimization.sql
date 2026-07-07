/* ===========================================================
   INDEX OPTIMIZATION SCRIPT
   Learning Management System (LMS)
   Database Team - Task: Review and Optimize Indexing Strategy
   Database: PostgreSQL
=========================================================== */

------------------------------------------------------------
-- 1. Review Existing Indexes
------------------------------------------------------------

SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public';

------------------------------------------------------------
-- 2. Recommended Indexes
------------------------------------------------------------

-- Users Table
CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_created_at
ON users(created_at);

-- Courses Table
CREATE INDEX IF NOT EXISTS idx_courses_status
ON courses(status);

CREATE INDEX IF NOT EXISTS idx_courses_created_at
ON courses(created_at);

-- Lessons Table
CREATE INDEX IF NOT EXISTS idx_lessons_course_id
ON lessons(course_id);

-- Enrollments Table
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id
ON enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_course_id
ON enrollments(course_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_status
ON enrollments(status);

-- Progress Table
CREATE INDEX IF NOT EXISTS idx_progress_user_id
ON progress(user_id);

CREATE INDEX IF NOT EXISTS idx_progress_course_id
ON progress(course_id);

------------------------------------------------------------
-- 3. Query Performance Analysis
------------------------------------------------------------

EXPLAIN ANALYZE
SELECT *
FROM users
WHERE user_id = 1;

EXPLAIN ANALYZE
SELECT *
FROM courses
WHERE course_id = 1;

EXPLAIN ANALYZE
SELECT *
FROM enrollments
WHERE user_id = 1;

------------------------------------------------------------
-- 4. Index Usage Statistics
------------------------------------------------------------

SELECT *
FROM pg_stat_user_indexes;

------------------------------------------------------------
-- 5. Users Table Indexes
------------------------------------------------------------

SELECT *
FROM pg_indexes
WHERE tablename = 'users';

------------------------------------------------------------
-- 6. Courses Table Indexes
------------------------------------------------------------

SELECT *
FROM pg_indexes
WHERE tablename = 'courses';

------------------------------------------------------------
-- 7. Enrollments Table Indexes
------------------------------------------------------------

SELECT *
FROM pg_indexes
WHERE tablename = 'enrollments';

------------------------------------------------------------
-- 8. Existing Database Size
------------------------------------------------------------

SELECT pg_size_pretty(
pg_database_size(current_database())
);

------------------------------------------------------------
-- 9. Active Connections
------------------------------------------------------------

SELECT *
FROM pg_stat_activity;

------------------------------------------------------------
-- End of Script
------------------------------------------------------------