import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import Home from "@/pages/Home";
import Courses from "@/pages/Courses/Courses";
import CourseDetails from "@/pages/Courses/CourseDetails";
import CreateCourse from "@/pages/Courses/CreateCourse";
import Dashboard from "@/pages/Dashboard/Dashboard";
import LearningPaths from "@/pages/Courses/LearningPaths";
import LearningPathDetails from "@/pages/Courses/LearningPathDetails";
import CoursePlayer from "@/pages/Courses/CoursePlayer";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import InstructorPortal from "@/pages/Portal/InstructorPortal";
import ManageCourse from "@/pages/Portal/ManageCourse";
import Profile from "@/pages/Profile/Profile";
import Certificate from "@/pages/Certificate/Certificate";
import CertificatesList from "@/pages/Certificate/CertificatesList";
import { AuthProvider } from "@/store/AuthContext";

export const AppRouter = () => {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* All pages share Navbar/Footer via MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:id/:token" element={<ResetPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/new" element={<CreateCourse />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/learn/:id" element={<CoursePlayer />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-paths/:id" element={<LearningPathDetails />} />
            <Route path="/portal" element={<InstructorPortal />} />
            <Route path="/portal/courses/:id" element={<ManageCourse />} />
            <Route path="/certificates" element={<CertificatesList />} />
            <Route path="/certificate/:courseId" element={<Certificate />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
