import apiClient from './apiClient';

/**
 * Create a new note for a lecture
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @param {string} content - Note content
 * @param {number} timestamp - Optional timestamp where note was taken
 * @returns {Promise<Object>} Created note
 */
export async function createNote(lectureId, userId, content, timestamp = null) {
  try {
    const response = await apiClient.post('/api/notes', {
      lecture_id: lectureId,
      user_id: userId,
      content: content,
      timestamp: timestamp
    });
    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

/**
 * Get all notes for a lecture
 * @param {number} lectureId - Lecture ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of notes
 */
export async function getLectureNotes(lectureId, userId) {
  try {
    const response = await apiClient.get(`/api/notes/lecture/${lectureId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
}

/**
 * Update a note
 * @param {number} noteId - Note ID
 * @param {string} content - Updated content
 * @returns {Promise<Object>} Updated note
 */
export async function updateNote(noteId, content) {
  try {
    const response = await apiClient.put(`/api/notes/${noteId}`, {
      content: content,
      updated_at: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

/**
 * Delete a note
 * @param {number} noteId - Note ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteNote(noteId) {
  try {
    const response = await apiClient.delete(`/api/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}

/**
 * Get all notes for a user in a course
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of notes
 */
export async function getCourseNotes(courseId, userId) {
  try {
    const response = await apiClient.get(`/api/notes/course/${courseId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching course notes:', error);
    return [];
  }
}

/**
 * Export notes as text or PDF
 * @param {number} courseId - Course ID
 * @param {number} userId - User ID
 * @param {string} format - Export format (text, pdf, json)
 * @returns {Promise<Object>} Export data
 */
export async function exportNotes(courseId, userId, format = 'text') {
  try {
    const response = await apiClient.get(`/api/notes/export/${courseId}/${userId}`, {
      params: { format }
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting notes:', error);
    throw error;
  }
}

/**
 * Search notes
 * @param {number} userId - User ID
 * @param {string} searchQuery - Search query
 * @returns {Promise<Array>} Matching notes
 */
export async function searchNotes(userId, searchQuery) {
  try {
    const response = await apiClient.get('/api/notes/search', {
      params: { user_id: userId, query: searchQuery }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching notes:', error);
    return [];
  }
}
