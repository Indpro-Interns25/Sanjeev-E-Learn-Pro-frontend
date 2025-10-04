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
    // Return empty array when backend is not available
    return [];
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
    
    // Try to use the real backend API first
    try {
      console.warn('🌐 Attempting to enroll via backend API...');
      const response = await apiClient.post('/api/enrollments', {
        user_id: userIdNum,
        course_id: courseIdNum
      });
      
      console.warn('✅ Backend enrollment successful:', response.data);
      
      // Dispatch custom event to notify other components of enrollment change
      window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { userId: userIdNum, courseId: courseIdNum, enrollment: response.data }
      }));
      
      return { 
        success: true, 
        message: 'Enrollment successful', 
        enrollment: response.data
      };
      
    } catch (apiError) {
      console.warn('❌ Backend enrollment failed, falling back to localStorage:', apiError.message);
      
      // Fallback to localStorage for offline mode
      const localEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      const newEnrollment = {
        id: Date.now(),
        user_id: userIdNum,
        course_id: courseIdNum,
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 0
      };
      
      // Check if already enrolled locally
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
      
      // Dispatch custom event to notify other components of enrollment change
      window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { userId: userIdNum, courseId: courseIdNum, enrollment: newEnrollment }
      }));
      
      console.warn('✅ Enrollment successful (localStorage):', newEnrollment);
      console.warn('📢 Dispatched enrollmentChanged event');
      
      return { 
        success: true, 
        message: 'Enrollment successful', 
        enrollment: newEnrollment
      };
    }
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
    
    try {
      // First try the real API endpoint
      const response = await apiClient.get(`/api/enrollments/users/${userIdNum}`);
      console.warn('📊 User enrollments API response:', response.data);
      console.warn('📊 Response structure analysis:');
      console.warn('  - Is Array?', Array.isArray(response.data));
      console.warn('  - Has success?', response.data?.success);
      console.warn('  - Has data?', response.data?.data);
      console.warn('  - Data type:', typeof response.data);
      console.warn('  - Response keys:', Object.keys(response.data || {}));
      
      // Handle wrapped response structure (like {success: true, data: [...]})
      if (response.data?.success && Array.isArray(response.data?.data)) {
        console.warn('✅ Wrapped array response format detected, returning data:', response.data.data);
        return response.data.data;
      }
      
      // Handle wrapped response with single object
      if (response.data?.success && response.data?.data && !Array.isArray(response.data.data)) {
        console.warn('✅ Wrapped single object response format detected, converting to array:', [response.data.data]);
        return [response.data.data];
      }
      
      // Handle direct array response
      if (Array.isArray(response.data)) {
        console.warn('✅ Direct array format detected, returning:', response.data);
        return response.data;
      }
      
      // Handle single object response (convert to array)
      if (response.data && typeof response.data === 'object' && response.data.id && response.data.course_id) {
        console.warn('✅ Single enrollment object detected, converting to array:', [response.data]);
        return [response.data];
      }
      
      // Handle empty response or null
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        console.warn('📭 Empty response detected, returning empty array');
        return [];
      }
      
      console.warn('⚠️ Unexpected response format, returning empty array. Response:', response.data);
      return [];
    } catch {
      console.warn('API not available, falling back to localStorage');
      
      // Fallback to localStorage for enrollments
      const localEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      const userEnrollments = localEnrollments.filter(e => e.user_id === userIdNum);
      
      console.warn('📱 Local enrollments found:', userEnrollments);
      return userEnrollments;
    }
    
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