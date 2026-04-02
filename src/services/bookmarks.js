import apiClient from './apiClient';

/**
 * Create a bookmark at a specific timestamp
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @param {number} timestamp - Timestamp in seconds
 * @param {string} title - Bookmark title/label
 * @returns {Promise<Object>} Created bookmark
 */
export async function createBookmark(lectureId, userId, timestamp, title) {
  try {
    const response = await apiClient.post('/api/bookmarks', {
      lecture_id: lectureId,
      user_id: userId,
      timestamp: timestamp,
      title: title
    });
    return response.data;
  } catch (error) {
    console.error('Error creating bookmark:', error);
    throw error;
  }
}

/**
 * Get all bookmarks for a lecture
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of bookmarks
 */
export async function getLectureBookmarks(lectureId, userId) {
  try {
    const response = await apiClient.get(`/api/bookmarks/lecture/${lectureId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }
}

/**
 * Update bookmark
 * @param {number} bookmarkId - Bookmark ID
 * @param {number} timestamp - New timestamp
 * @param {string} title - New title
 * @returns {Promise<Object>} Updated bookmark
 */
export async function updateBookmark(bookmarkId, timestamp, title) {
  try {
    const response = await apiClient.put(`/api/bookmarks/${bookmarkId}`, {
      timestamp: timestamp,
      title: title
    });
    return response.data;
  } catch (error) {
    console.error('Error updating bookmark:', error);
    throw error;
  }
}

/**
 * Delete bookmark
 * @param {number} bookmarkId - Bookmark ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteBookmark(bookmarkId) {
  try {
    const response = await apiClient.delete(`/api/bookmarks/${bookmarkId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
}

/**
 * Get all bookmarks for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of all user bookmarks
 */
export async function getUserBookmarks(userId) {
  try {
    const response = await apiClient.get(`/api/bookmarks/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return [];
  }
}
