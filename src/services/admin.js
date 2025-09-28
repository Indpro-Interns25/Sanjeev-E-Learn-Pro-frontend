import apiClient from './apiClient';

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>} Promise that resolves to admin stats object
 */
export async function getAdminStats() {
  try {
    console.log('📊 Fetching admin stats from API...');
    const response = await apiClient.get('/api/admin/stats');
    console.log('📈 Admin stats received:', response.data);
    return response.data.data; // Return the data property from the response
  } catch (error) {
    console.error('🚨 Failed to fetch admin stats:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available, using fallback data');
      // Return fallback stats
      return {
        totalStudents: 0,
        totalInstructors: 0,
        totalCourses: 0,
        totalLessons: 0,
        totalEnrollments: 0,
        activeUsers: 0,
        recentActivity: []
      };
    }
    
    if (error.response?.status === 401) {
      throw new Error('Unauthorized access to admin stats');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Insufficient permissions to access admin stats');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch admin statistics';
    throw new Error(message);
  }
}

/**
 * Get all students (admin view)
 * @returns {Promise<Array>} Promise that resolves to students array
 */
export async function getAllStudents() {
  try {
    const response = await apiClient.get('/api/admin/students');
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available');
      return [];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch students';
    throw new Error(message);
  }
}

/**
 * Get all instructors (admin view)
 * @returns {Promise<Array>} Promise that resolves to instructors array
 */
export async function getAllInstructors() {
  try {
    const response = await apiClient.get('/api/admin/instructors');
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available');
      return [];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch instructors';
    throw new Error(message);
  }
}

/**
 * Get all courses (admin view)
 * @returns {Promise<Array>} Promise that resolves to courses array
 */
export async function getAllCoursesAdmin() {
  try {
    console.log('📚 Fetching admin courses from API...');
    const response = await apiClient.get('/api/admin/courses');
    console.log('📊 Admin courses received:', response.data);
    return response.data.data; // Return the data property from the response
  } catch (error) {
    console.error('🚨 Failed to fetch admin courses:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available');
      return [];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch courses';
    throw new Error(message);
  }
}

/**
 * Get all lessons (admin view) - CLEAN VERSION
 * @returns {Promise<Array>} Promise that resolves to lessons array
 */
export async function getAllLessonsAdmin() {
  try {
    console.warn('📝 Fetching admin lessons from API...');
    const cleanUrl = '/api/admin/lessons';
    const response = await apiClient.get(cleanUrl);
    console.warn('📚 Admin lessons received:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('🚨 Failed to fetch admin lessons:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available');
      return [];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch lessons';
    throw new Error(message);
  }
}

// Export default object with all functions for easier importing
export default {
  getAdminStats,
  getAllStudents,
  getAllInstructors,
  getAllCoursesAdmin,
  getAllLessonsAdmin
};