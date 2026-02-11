import api from './api';

/**
 * Course Service
 * Handles all course-related API calls
 */

// Get all courses
export const getAllCourses = async () => {
  const response = await api.get('/courses');
  return response.data.courses;
};

// Get courses user is teaching
export const getMyTeachingCourses = async () => {
  const response = await api.get('/courses/teaching');
  return response.data.courses;
};

// Get courses user is learning
export const getMyLearningCourses = async () => {
  const response = await api.get('/courses/learning');
  return response.data.courses;
};

// Create a new course
export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data.course;
};

// Enroll in a course
export const enrollInCourse = async (courseId) => {
  const response = await api.post(`/courses/${courseId}/enroll`);
  return response.data;
};
