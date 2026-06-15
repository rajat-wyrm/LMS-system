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
          </Route>
        </Route>

        {/* Redirect any other path to root */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
