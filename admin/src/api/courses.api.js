import { apiFetch } from './config';

export const courseApi = {
  // Get all courses
  getAllCourses: () => apiFetch('/courses'),
  
  // Get trending courses
  getTrendingCourses: (limit = 6) => apiFetch(`/courses/trending?limit=${limit}`),
  
  // Get admin courses
  getAdminCourses: (page = 1, limit = 10) => apiFetch(`/courses/admin/all?page=${page}&limit=${limit}`),
  
  // Get single course
  getCourseById: (id) => apiFetch(`/courses/${id}`),
  
  // Create course
  createCourse: (data) => apiFetch('/courses', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Update course
  updateCourse: (id, data) => apiFetch(`/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Delete course
  deleteCourse: (id) => apiFetch(`/courses/${id}`, {
    method: 'DELETE'
  }),
  
  // Add lesson
  addLesson: (courseId, data) => apiFetch(`/courses/${courseId}/lessons`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Delete lesson
  deleteLesson: (courseId, lessonId) => apiFetch(`/courses/${courseId}/lessons/${lessonId}`, {
    method: 'DELETE'
  }),
  
  // Generate lessons with AI
  generateLessonsAI: (courseId) => apiFetch(`/courses/${courseId}/generate-lessons`, {
    method: 'POST'
  })
};
