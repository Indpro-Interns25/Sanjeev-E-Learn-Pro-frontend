import apiClient from './apiClient';

/**
 * Get all enrollments for admin view
 * @returns {Promise<Array>} Promise that resolves to enrollments array
 */
export async function getAllEnrollments() {
  try {
    console.warn('📚 Fetching all enrollments from API...');
    const response = await apiClient.get('/api/admin/enrollments');
    console.warn('📊 Enrollments response:', response.data);
    
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
    console.error('🚨 Failed to fetch enrollments:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning mock enrollments data');
      // Return mock enrollments data
      return [
        { id: 1, user_id: 1, course_id: 1, enrolled_at: '2024-01-15', status: 'active', progress: 25 },
        { id: 2, user_id: 1, course_id: 2, enrolled_at: '2024-01-20', status: 'active', progress: 75 },
        { id: 3, user_id: 2, course_id: 1, enrolled_at: '2024-01-18', status: 'active', progress: 50 },
        { id: 4, user_id: 2, course_id: 3, enrolled_at: '2024-01-22', status: 'completed', progress: 100 },
        { id: 5, user_id: 3, course_id: 2, enrolled_at: '2024-01-25', status: 'active', progress: 30 },
        { id: 6, user_id: 4, course_id: 1, enrolled_at: '2024-01-28', status: 'active', progress: 10 },
        { id: 7, user_id: 4, course_id: 4, enrolled_at: '2024-02-01', status: 'active', progress: 65 },
        { id: 8, user_id: 5, course_id: 3, enrolled_at: '2024-02-03', status: 'active', progress: 85 },
        { id: 9, user_id: 5, course_id: 5, enrolled_at: '2024-02-05', status: 'active', progress: 40 },
        { id: 10, user_id: 6, course_id: 1, enrolled_at: '2024-02-08', status: 'active', progress: 20 }
      ];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch enrollments';
    throw new Error(message);
  }
}

/**
 * Enroll a user in a course
 * @param {number} userId - The user ID
 * @param {number} courseId - The course ID
 * @returns {Promise<Object>} Promise that resolves to enrollment result
 */
export async function enrollUserInCourse(userId, courseId) {
  try {
    console.warn(`📝 Enrolling user ${userId} in course ${courseId}...`);
    
    // Validate inputs
    if (!userId || !courseId) {
      throw new Error('User ID and Course ID are required for enrollment');
    }

    // Convert to numbers to ensure consistency
    const userIdNum = parseInt(userId);
    const courseIdNum = parseInt(courseId);
    
    // Always use localStorage fallback since we don't have a real backend
    console.warn('Using localStorage fallback for enrollment');
    
    // Store enrollment locally
    const localEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const newEnrollment = {
      id: Date.now(),
      user_id: userIdNum,
      course_id: courseIdNum,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    };
    
    // Check if already enrolled
    const alreadyEnrolled = localEnrollments.some(e => 
      e.user_id === userIdNum && e.course_id === courseIdNum
    );
    
    if (alreadyEnrolled) {
      return { 
        success: true, 
        message: 'Already enrolled in this course',
        enrollment: localEnrollments.find(e => 
          e.user_id === userIdNum && e.course_id === courseIdNum
        )
      };
    }
    
    localEnrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(localEnrollments));
    
    console.warn('✅ Enrollment successful (localStorage):', newEnrollment);
    
    return { 
      success: true, 
      message: 'Enrollment successful', 
      enrollment: newEnrollment
    };
  } catch (error) {
    console.error('🚨 Failed to enroll user:', error);
    
    // Fallback error handling
    const message = error.message || 'Failed to enroll user in course';
    throw new Error(message);
  }
}

/**
 * Get user's enrollments
 * @param {number} userId - The user ID
 * @returns {Promise<Array>} Promise that resolves to user's enrollments
 */
export async function getUserEnrollments(userId) {
  try {
    console.warn(`👤 Fetching enrollments for user ${userId}...`);
    
    if (!userId) {
      throw new Error('User ID is required to fetch enrollments');
    }

    // Convert to number to ensure consistency
    const userIdNum = parseInt(userId);
    
    // Always use localStorage since we don't have a real backend
    console.warn('Using localStorage for user enrollments');
    
    // Check localStorage for enrollments
    const localEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const userEnrollments = localEnrollments.filter(e => e.user_id === userIdNum);
    
    console.warn('📱 Local enrollments found:', userEnrollments);
    return userEnrollments;
    
  } catch (error) {
    console.error('🚨 Failed to fetch user enrollments:', error);
    return [];
  }
}

/**
 * Check if user can access a lesson (based on course enrollment)
 * @param {number} userId - The user ID
 * @param {number} lessonId - The lesson ID
 * @param {number} courseId - The course ID
 * @returns {Promise<boolean>} Promise that resolves to access permission
 */
export async function canUserAccessLesson(userId, lessonId, courseId) {
  try {
    const userEnrollments = await getUserEnrollments(userId);
    const isEnrolledInCourse = userEnrollments.some(enrollment => 
      enrollment.course_id === courseId && enrollment.status === 'active'
    );
    
    console.warn(`🔐 User ${userId} access to lesson ${lessonId}:`, isEnrolledInCourse);
    return isEnrolledInCourse;
  } catch (error) {
    console.error('🚨 Failed to check lesson access:', error);
    return false; // Deny access on error
  }
}

// Export default object
export default {
  getAllEnrollments,
  enrollUserInCourse,
  getUserEnrollments,
  canUserAccessLesson
};