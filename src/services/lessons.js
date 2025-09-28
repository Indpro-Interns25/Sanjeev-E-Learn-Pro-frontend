import apiClient from './apiClient';

/**
 * Get course curriculum (course details + lessons)
 * @param {number} courseId - The course ID
 * @returns {Promise<Object>} Promise that resolves to course curriculum object
 */
export async function getCourseCurriculum(courseId) {
  try {
    console.log('🌐 Making API call to:', `/api/courses/${courseId}/curriculum`);
    const response = await apiClient.get(`/api/courses/${courseId}/curriculum`);
    console.log('📡 API response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 API call failed:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course curriculum not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch course curriculum';
    throw new Error(message);
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course or lessons not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch lessons';
    throw new Error(message);
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch lesson';
    throw new Error(message);
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to create lessons');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to create lesson';
    throw new Error(message);
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to update this lesson');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to update lesson';
    throw new Error(message);
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
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Lesson not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to delete this lesson');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to delete lesson';
    throw new Error(message);
  }
}

// Export default object with all functions for easier importing
export default {
  getCourseCurriculum,
  getLessonsByCourseId,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson
};