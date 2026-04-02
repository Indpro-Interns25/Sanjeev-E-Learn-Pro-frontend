import apiClient from './apiClient';

/**
 * Track video progress and save timestamp
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @param {number} currentTime - Current playback time in seconds
 * @param {number} duration - Total video duration in seconds
 * @returns {Promise<Object>} Updated progress data
 */
export async function saveVideoProgress(lectureId, userId, currentTime, duration) {
  try {
    const response = await apiClient.post('/api/video-progress', {
      lecture_id: lectureId,
      user_id: userId,
      current_time: currentTime,
      duration: duration,
      progress_percentage: Math.round((currentTime / duration) * 100)
    });
    return response.data;
  } catch (error) {
    console.error('Error saving video progress:', error);
    throw error;
  }
}

/**
 * Get last watched timestamp for a video
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Progress data with last watched timestamp
 */
export async function getVideoProgress(lectureId, userId) {
  try {
    const response = await apiClient.get(`/api/video-progress/${lectureId}/${userId}`);
    return response.data;
  } catch (error) {
    // If not found, return default
    if (error.response?.status === 404) {
      return { current_time: 0, duration: 0, progress_percentage: 0 };
    }
    console.error('Error fetching video progress:', error);
    throw error;
  }
}

/**
 * Mark lecture as completed
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Completion status
 */
export async function markLectureCompleted(lectureId, userId) {
  try {
    const response = await apiClient.post(`/api/video-progress/${lectureId}/${userId}/complete`);
    return response.data;
  } catch (error) {
    console.error('Error marking lecture as completed:', error);
    throw error;
  }
}

/**
 * Get course progress (percentage of lectures completed)
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Course progress data
 */
export async function getCourseProgress(courseId, userId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return { completed: 0, total: 0, percentage: 0 };
  }
}

/**
 * Get all video progress for a user in a course
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of progress data
 */
export async function getCourseVideoProgress(courseId, userId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/video-progress/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course video progress:', error);
    return [];
  }
}

/**
 * Get resume point for a course (last watched lecture and timestamp)
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Resume data with lecture and timestamp
 */
export async function getResumePoint(courseId, userId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/resume/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching resume point:', error);
    return null;
  }
}

/**
 * Batch update video progress
 * @param {number} userId - User ID
 * @param {Array<Object>} progressData - Array of progress objects
 * @returns {Promise<Object>} Update result
 */
export async function batchUpdateProgress(userId, progressData) {
  try {
    const response = await apiClient.post('/api/video-progress/batch', {
      user_id: userId,
      progress: progressData
    });
    return response.data;
  } catch (error) {
    console.error('Error batch updating progress:', error);
    throw error;
  }
}
