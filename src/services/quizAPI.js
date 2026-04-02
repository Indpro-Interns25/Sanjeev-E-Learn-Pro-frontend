import apiClient from './apiClient';

/**
 * Quiz API Service
 * Handles all quiz-related API calls
 */

// Get quiz for a course
export const getCourseQuiz = async (courseId) => {
  try {
    const response = await apiClient.get(`/api/quiz/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

// Get quiz by ID
export const getQuizById = async (quizId) => {
  try {
    const response = await apiClient.get(`/api/quiz/${quizId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
};

// Submit quiz answers
export const submitQuizAnswers = async (quizId, userId, answers) => {
  try {
    const response = await apiClient.post(`/api/quiz/${quizId}/submit`, {
      userId,
      answers,
      submittedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

// Get quiz result by ID
export const getQuizResult = async (resultId) => {
  try {
    const response = await apiClient.get(`/api/quiz/result/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    throw error;
  }
};

// Get user's quiz history
export const getUserQuizHistory = async (userId) => {
  try {
    const response = await apiClient.get(`/api/quiz/history/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    throw error;
  }
};

// Get user's quiz result for a course
export const getUserQuizResult = async (courseId, userId) => {
  try {
    const response = await apiClient.get(`/api/quiz/result/course/${courseId}/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    throw error;
  }
};

export default {
  getCourseQuiz,
  getQuizById,
  submitQuizAnswers,
  getQuizResult,
  getUserQuizHistory,
  getUserQuizResult
};
