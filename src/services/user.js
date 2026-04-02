import apiClient from './apiClient';

/**
 * Get user's enrolled courses
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Promise that resolves to enrolled courses array
 */
export async function getEnrolledCourses(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch enrolled courses');
    }

    console.warn(`🌐 Fetching enrolled courses from API for user ${userId}...`);
    
    // Use the same endpoint as enrollment.js for consistency
    // This ensures compatibility with backend
    const response = await apiClient.get(`/api/enrollments/users/${userId}`);
    console.warn('📚 Enrolled courses received:', response.data);
    
    // Handle wrapped response structure
    if (response.data?.success && Array.isArray(response.data?.data)) {
      return response.data.data;
    }
    
    // Handle direct array response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // Handle single object response (convert to array)
    if (response.data && typeof response.data === 'object') {
      return [response.data];
    }
    
    return [];
  } catch (error) {
    console.error('🚨 Failed to fetch enrolled courses:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available, using fallback data');
      // Return empty array as fallback
      return [];
    }
    
    if (error.response?.status === 404) {
      return []; // No enrolled courses
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch enrolled courses';
    console.error(message);
    return [];
  }
}

/**
 * Get user's learning statistics
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Promise that resolves to user stats object
 */
export async function getUserStats(userId) {
  try {
    if (!userId) {
      throw new Error('User ID is required to fetch user stats');
    }

    console.warn(`📊 Fetching user stats from API for user ${userId}...`);
    const response = await apiClient.get(`/api/user/${userId}/stats`);
    console.warn('📈 User stats received:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 Failed to fetch user stats:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available, calculating stats from enrolled courses');
      
      // Fallback: Calculate stats from enrolled courses
      try {
        const enrolledCourses = await getEnrolledCourses(userId);
        return calculateStatsFromCourses(enrolledCourses);
      } catch (coursesError) {
        console.error('Could not fetch enrolled courses for stats calculation:', coursesError);
        return {
          coursesInProgress: 0,
          completedCourses: 0,
          totalLessons: 0,
          completedLessons: 0
        };
      }
    }
    
    if (error.response?.status === 404) {
      return {
        coursesInProgress: 0,
        completedCourses: 0,
        totalLessons: 0,
        completedLessons: 0
      };
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch user statistics';
    console.error(message);
    
    // Return default stats on error instead of throwing
    return {
      coursesInProgress: 0,
      completedCourses: 0,
      totalLessons: 0,
      completedLessons: 0
    };
  }
}

/**
 * Calculate user statistics from enrolled courses data
 * @param {Array} enrolledCourses - Array of enrolled course objects
 * @returns {Object} User statistics object
 */
function calculateStatsFromCourses(enrolledCourses) {
  const stats = enrolledCourses.reduce((acc, course) => {
    // Count courses by status
    if (course.status === 'completed') {
      acc.completedCourses++;
    } else if (course.status === 'in_progress') {
      acc.coursesInProgress++;
    }
    
    // Sum lessons
    acc.totalLessons += parseInt(course.total_lessons || 0);
    acc.completedLessons += parseInt(course.completed_lessons || 0);
    
    return acc;
  }, {
    coursesInProgress: 0,
    completedCourses: 0,
    totalLessons: 0,
    completedLessons: 0
  });
  
  console.warn('📊 Calculated stats from courses:', stats);
  return stats;
}

/**
 * Enroll user in a course
 * @param {number} userId - The user ID
 * @param {number} courseId - Course ID to enroll in
 * @returns {Promise<Object>} Promise that resolves to enrollment result
 */
export async function enrollInCourse(userId, courseId) {
  try {
    if (!userId || !courseId) {
      throw new Error('User ID and Course ID are required to enroll');
    }

    console.warn(`📝 Enrolling user ${userId} in course ${courseId}...`);
    const response = await apiClient.post(`/api/user/${userId}/courses/${courseId}/enroll`, {
      userId,
      courseId
    });
    console.warn('✅ Enrollment successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('🚨 Enrollment error:', error);
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server.');
    }
    
    if (error.response?.status === 400) {
      throw new Error('Already enrolled in this course');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to enroll in course';
    throw new Error(message);
  }
}

/**
 * Get user's progress for a specific course
 * @param {number} userId - The user ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Promise that resolves to progress object
 */
export async function getCourseProgress(userId, courseId) {
  try {
    if (!userId || !courseId) {
      throw new Error('User ID and Course ID are required to fetch progress');
    }

    console.warn(`📈 Fetching progress for user ${userId} in course ${courseId}...`);
    const response = await apiClient.get(`/api/user/${userId}/courses/${courseId}/progress`);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend API server not available, using fallback progress');
      return {
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0
      };
    }
    
    if (error.response?.status === 404) {
      return {
        completedLessons: 0,
        totalLessons: 0,
        progressPercentage: 0
      };
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch course progress';
    console.error(message);
    
    return {
      completedLessons: 0,
      totalLessons: 0,
      progressPercentage: 0
    };
  }
}

// Export default object with all functions for easier importing
export default {
  getEnrolledCourses,
  getUserStats,
  enrollInCourse,
  getCourseProgress
};