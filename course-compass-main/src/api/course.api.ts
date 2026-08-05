import API from "./client";

export interface CourseData {
  id?: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price?: number;
  thumbnail?: string;
  celebrityTeacher?: string;
  instructor?: {
    id: string;
    name: string;
  };
  _count?: {
    enrollments: number;
  };
  generateAI?: boolean;
}


export const courseApi = {
  getAllCourses: () => API.get("/courses"),
  getLearningPaths: () => API.get("/courses/learning-paths"),
  getCourseById: (id: string) => API.get(`/courses/${id}`),
  createCourse: (data: CourseData) => API.post("/courses", data),
  generateLessonsAI: (courseId: string) => API.post(`/courses/${courseId}/generate-lessons`),
  updateCourse: (id: string, data: Partial<CourseData>) => API.put(`/courses/${id}`, data),
  deleteCourse: (id: string) => API.delete(`/courses/${id}`),

  // Enrollment
  enrollInCourse: (courseId: string, data?: { mentor: string }) => API.post(`/enrollments/${courseId}`, data),
  unenrollFromCourse: (courseId: string) => API.delete(`/enrollments/${courseId}`),
  getMyEnrollments: () => API.get("/enrollments"),
  getEnrollmentByCourse: (courseId: string) => API.get(`/enrollments/${courseId}`),
  updateEnrollmentMentor: (courseId: string, mentor: string) => API.put(`/enrollments/${courseId}/mentor`, { mentor }),
  completeLesson: (courseId: string, lessonId: string) => API.put(`/enrollments/${courseId}/lessons/${lessonId}`),

  // Lessons
  addLesson: (courseId: string, data: { title: string; content: string; videoUrl?: string; order: number }) => API.post(`/courses/${courseId}/lessons`, data),
  deleteLesson: (courseId: string, lessonId: string) => API.delete(`/courses/${courseId}/lessons/${lessonId}`),

  // Stats
  getInstructorStats: () => API.get("/courses/instructor/stats"),
};
