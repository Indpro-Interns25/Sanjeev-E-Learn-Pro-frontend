import apiClient from './apiClient';
import { mockLessons } from '../data/mockLessons';
import { getApiErrorMessage } from './apiError';

/**
 * Get all lessons (public endpoint)
 * @returns {Promise<Array>} Promise that resolves to lessons array
 */
export async function getAllLessons() {
  try {
    console.warn('📝 Fetching all lessons from API...');
    const response = await apiClient.get('/api/lessons');
    console.warn('📚 All lessons received:', response.data);
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback if the response structure is different
    return response.data || [];
  } catch {
    console.warn('API not available, using mock lessons data');
    return mockLessons;
  }
}

/**
 * Get course curriculum (course details + lessons)
 * @param {number} courseId - The course ID
 * @returns {Promise<Object>} Promise that resolves to course curriculum object
 */
export async function getCourseCurriculum(courseId) {
  try {
    console.warn('🌐 Making API call to:', `/api/courses/${courseId}/curriculum`);
    const response = await apiClient.get(`/api/courses/${courseId}/curriculum`);
    console.warn('📡 API response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 API call failed:', error);
    if (error.response?.status === 404) {
      throw new Error('Course curriculum not found');
    }

    throw new Error(getApiErrorMessage(error, 'Failed to fetch course curriculum'));
  }
}

/**
 * Get all lessons for a specific course
 * @param {number} courseId - Course ID
 * @returns {Promise<Array>} Array of lesson objects
 */
export async function getLessonsByCourseId(courseId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/lessons`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Course or lessons not found');
    }

    throw new Error(getApiErrorMessage(error, 'Failed to fetch lessons'));
  }
}

/**
 * Get a specific lesson by ID
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<Object>} Lesson object
 */
export async function getLessonById(lessonId) {
  try {
    const response = await apiClient.get(`/api/lessons/${lessonId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }

    throw new Error(getApiErrorMessage(error, 'Failed to fetch lesson'));
  }
}

/**
 * Create a new lesson (instructor only)
 * @param {Object} lessonData - Lesson data
 * @returns {Promise<Object>} Created lesson object
 */
export async function createLesson(lessonData) {
  try {
    const response = await apiClient.post('/api/lessons', lessonData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to create lessons');
    }

    throw new Error(getApiErrorMessage(error, 'Failed to create lesson'));
  }
}

/**
 * Update an existing lesson (instructor only)
 * @param {number} lessonId - Lesson ID
 * @param {Object} lessonData - Updated lesson data
 * @returns {Promise<Object>} Updated lesson object
 */
export async function updateLesson(lessonId, lessonData) {
  try {
    const response = await apiClient.put(`/api/lessons/${lessonId}`, lessonData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to update this lesson');
    }
    
    throw new Error(getApiErrorMessage(error, 'Failed to update lesson'));
  }
}

/**
 * Delete a lesson (instructor only)
 * @param {number} lessonId - Lesson ID
 * @returns {Promise<void>}
 */
export async function deleteLesson(lessonId) {
  try {
    await apiClient.delete(`/api/lessons/${lessonId}`);
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to delete this lesson');
    }
    
    throw new Error(getApiErrorMessage(error, 'Failed to delete lesson'));
  }
}

// Export default object with all functions for easier importing
export default {
  getAllLessons,
  getCourseCurriculum,
  getLessonsByCourseId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};