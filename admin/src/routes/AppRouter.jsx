import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import AdminLogin from '../pages/Auth/AdminLogin';

// Admin Dashboards
import AdminDashboard from '../pages/Dashboard/Admin/Dashboard';
import AdminStudents from '../pages/Dashboard/Admin/Students';
import AdminCourses from '../pages/Dashboard/Admin/Courses';
import AdminTeachers from '../pages/Dashboard/Admin/Teachers';
import AdminAnalytics from '../pages/Dashboard/Admin/Analytics';
import AdminReviews from '../pages/Dashboard/Admin/Reviews';
import AdminNotifications from '../pages/Dashboard/Admin/Notifications';
import AdminSettings from '../pages/Dashboard/Admin/Settings';
import DailyChallenges from '../pages/Dashboard/Admin/DailyChallenges';
import StudyPlanner from '../pages/Dashboard/Admin/StudyPlanner';
import AchievementBadges from '../pages/Dashboard/Admin/AchievementBadges';
import CareerOptions from '../pages/Dashboard/Admin/CareerOptions';

// Route Guards
import AdminRoute from './AdminRoute';
import AdminLayout from '../layouts/AdminLayout';

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Dashboard Routes */}
        <Route element={<AdminLayout />}>
          <Route element={<AdminRoute />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/students" element={<AdminStudents />} />
            <Route path="/dashboard/admin/courses" element={<AdminCourses />} />
            <Route path="/dashboard/admin/teachers" element={<AdminTeachers />} />
            <Route path="/dashboard/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/dashboard/admin/reviews" element={<AdminReviews />} />
            <Route path="/dashboard/admin/notifications" element={<AdminNotifications />} />
            <Route path="/dashboard/admin/settings" element={<AdminSettings />} />
            <Route path="/dashboard/admin/daily-challenges" element={<DailyChallenges />} />
            <Route path="/dashboard/admin/study-planner" element={<StudyPlanner />} />
            <Route path="/dashboard/admin/achievement-badges" element={<AchievementBadges />} />
            <Route path="/dashboard/admin/career-options" element={<CareerOptions />} />
          </Route>
        </Route>

        {/* Redirect any other path to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
