import apiClient from './apiClient';

/**
 * Get admin dashboard statistics
 * @returns {Promise<Object>} Promise that resolves to admin stats object
 */
export async function getAdminStats() {
  try {
    console.warn('📊 Fetching admin stats from API...');
    const response = await apiClient.get('/api/admin/stats');
    console.warn('📈 Admin stats received:', response.data);
    
    // Handle the API response structure: { success: true, data: {...} }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for different response structures
    if (response.data.data) {
      return response.data.data;
    }
    
    return response.data || {
      totalStudents: 0,
      totalInstructors: 0,
      totalCourses: 0,
      totalLessons: 0,
      totalEnrollments: 0,
      activeUsers: 0,
      recentActivity: []
    };
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
    console.warn('👥 Fetching students from API...');
    const response = await apiClient.get('/api/admin/students');
    console.warn('👥 Students response:', response.data);
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('🚨 Failed to fetch students:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty array');
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
    console.warn('👨‍🏫 Fetching instructors from API...');
    const response = await apiClient.get('/api/admin/instructors');
    console.warn('👨‍🏫 Instructors response:', response.data);
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('🚨 Failed to fetch instructors:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty array');
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
    console.warn('📚 Fetching admin courses from API...');
    const response = await apiClient.get('/api/admin/courses');
    console.warn('📊 Admin courses received:', response.data);
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('🚨 Failed to fetch admin courses:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty array');
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
    const response = await apiClient.get('/api/admin/lessons');
    console.warn('📚 Admin lessons received:', response.data);
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Fallback for different response structures
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('🚨 Failed to fetch admin lessons:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty array');
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