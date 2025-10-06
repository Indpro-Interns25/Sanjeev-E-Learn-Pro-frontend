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
    
    // Handle the API response structure: { success: true, data: { stats: {...}, recentActivity: [...] } }
    if (response.data.success && response.data.data && response.data.data.stats) {
      const apiStats = response.data.data.stats;
      const recentActivity = response.data.data.recentActivity || [];
      
      // Convert API format to frontend format
      const formattedStats = {
        totalStudents: parseInt(apiStats.total_students) || 0,
        totalInstructors: parseInt(apiStats.total_instructors) || 0,
        totalCourses: parseInt(apiStats.total_courses) || 0,
        totalLessons: parseInt(apiStats.total_lessons) || 0,
        totalEnrollments: parseInt(apiStats.total_enrollments) || 0,
        pendingStudents: parseInt(apiStats.pending_students) || 0,
        pendingInstructors: parseInt(apiStats.pending_instructors) || 0,
        pendingCourses: parseInt(apiStats.pending_courses) || 0,
        activeUsers: parseInt(apiStats.total_students) + parseInt(apiStats.total_instructors) || 0,
        recentActivity: recentActivity
      };
      
      console.warn('✅ Formatted stats:', formattedStats);
      return formattedStats;
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
    console.warn('⚠️ Returning empty stats due to API failure');
    // Return empty stats when API fails - no mock data
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
      const students = response.data.data.map(student => ({
        ...student,
        // Convert string numbers to integers for proper display
        enrolled_courses: parseInt(student.enrolled_courses) || 0,
        completed_lessons: parseInt(student.completed_lessons) || 0,
        // Calculate progress percentage (completed lessons / total possible lessons * 100)
        progress: student.enrolled_courses > 0 ? 
          Math.round((parseInt(student.completed_lessons) || 0) / (parseInt(student.enrolled_courses) * 5) * 100) : 0,
        // Use existing created_at or current date
        created_at: student.created_at || new Date().toISOString()
      }));
      
      console.warn('✅ Real students from API:', students);
      return students;
    }
    
    // Fallback for different response structures
    if (Array.isArray(response.data)) {
      return response.data.map(student => ({
        ...student,
        enrolled_courses: parseInt(student.enrolled_courses) || 0,
        completed_lessons: parseInt(student.completed_lessons) || 0,
        progress: 0,
        created_at: student.created_at || new Date().toISOString()
      }));
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('🚨 Failed to fetch students:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty student list');
      // Return empty array when backend is not available
      // This removes all demo/mock data
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
    
    let instructors = [];
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      instructors = response.data.data;
    } else if (Array.isArray(response.data)) {
      instructors = response.data;
    } else {
      instructors = response.data.data || [];
    }
    
    // Calculate course counts for each instructor
    if (instructors.length > 0) {
      try {
        console.warn('📊 Calculating course counts for instructors...');
  // Add a cache-busting timestamp param to avoid 304 cached responses
  const coursesResponse = await apiClient.get('/api/admin/courses', { params: { t: Date.now() } });
        
        let courses = [];
        if (coursesResponse.data.success && coursesResponse.data.data) {
          courses = coursesResponse.data.data;
        } else if (Array.isArray(coursesResponse.data)) {
          courses = coursesResponse.data;
        }
        
        // Count courses per instructor
        instructors = instructors.map(instructor => {
          const instructorCourses = courses.filter(course => 
            (course.instructor_id || course.user_id) === instructor.id
          );
          
          return {
            ...instructor,
            total_courses: instructorCourses.length
          };
        });
        
        console.warn('✅ Successfully calculated course counts for instructors');
      } catch (courseError) {
        console.warn('❌ Failed to fetch courses for instructor count calculation:', courseError.message);
        // Set default course count to 0
        instructors = instructors.map(instructor => ({
          ...instructor,
          total_courses: instructor.total_courses || 0
        }));
      }
    }
    
    return instructors;
  } catch (error) {
    console.error('🚨 Failed to fetch instructors:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty instructors list');
      // Return empty array instead of mock data
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
 * Create a new instructor
 * @param {Object} instructorData - The instructor data
 * @returns {Promise<Object>} Promise that resolves to created instructor
 */
export async function createInstructor(instructorData) {
  try {
    console.warn('👨‍🏫 Creating instructor via API...', instructorData);
    const response = await apiClient.post('/api/admin/instructors', instructorData);
    console.warn('✅ Instructor created successfully:', response.data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('🚨 Failed to create instructor:', error);
    
    // Handle specific API endpoint not found error
    if (error.response?.status === 404) {
      throw new Error('⚠️ API Endpoint Missing: The backend POST /api/admin/instructors endpoint is not implemented yet. Please ask the backend developer to create this endpoint to enable real instructor creation.');
    }
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available for instructor creation');
      throw new Error('🔌 Backend API not available. Instructor creation requires a working backend server.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to create instructor';
    throw new Error(message);
  }
}

/**
 * Create a new course (admin)
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course object
 */
export async function createCourseAdmin(courseData) {
  try {
    console.warn('📝 Creating admin course via API...', courseData);
    const response = await apiClient.post('/api/admin/courses', courseData);
    console.warn('✅ Admin course created successfully:', response.data);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    return response.data;
  } catch (error) {
    console.error('🚨 Failed to create admin course:', error);

    // Specific helpful messages for common failure modes
    if (error.response?.status === 404) {
      throw new Error('⚠️ API Endpoint Missing: POST /api/admin/courses is not implemented on the backend.');
    }

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('🔌 Cannot connect to backend. Please ensure the backend server is running on http://localhost:3002');
    }

    if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login as admin and try again.');
    }

    if (error.response?.status === 403) {
      throw new Error('Forbidden. You do not have permission to create courses.');
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to create course';
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
  // Add a cache-busting timestamp param to ensure we get fresh course data
  const response = await apiClient.get('/api/admin/courses', { params: { t: Date.now() } });
    console.warn('📊 Admin courses received:', response.data);
    
    let courses = [];
    
    // Handle the API response structure: { success: true, data: [...] }
    if (response.data.success && response.data.data) {
      courses = response.data.data;
    } else if (Array.isArray(response.data)) {
      courses = response.data;
    } else {
      courses = response.data.data || [];
    }
    
    // Enrich courses with instructor names if missing
    if (courses.length > 0 && !courses[0].instructor_name && !courses[0].instructor?.name) {
      console.warn('📚 Admin courses missing instructor names, attempting to fetch instructor data...');
      
      try {
        // Try to fetch instructors to match with courses
        const instructorsResponse = await apiClient.get('/api/admin/instructors');
        
        if (instructorsResponse.data.success && instructorsResponse.data.data) {
          const instructors = instructorsResponse.data.data;
          
          // Create a map of instructor ID to instructor data
          const instructorMap = {};
          instructors.forEach(instructor => {
            instructorMap[instructor.id] = instructor;
          });
          
          // Enrich courses with instructor names and calculate course counts
          courses = courses.map(course => {
            const instructor = instructorMap[course.instructor_id || course.user_id];
            return {
              ...course,
              instructor_name: instructor ? instructor.name : 'Unknown Instructor',
              instructor: instructor ? {
                id: instructor.id,
                name: instructor.name,
                email: instructor.email
              } : null
            };
          });
          
          // Update instructor course counts
          instructors.forEach(instructor => {
            const instructorCourses = courses.filter(course => 
              (course.instructor_id || course.user_id) === instructor.id
            );
            instructor.total_courses = instructorCourses.length;
          });
          
          console.warn('✅ Successfully enriched admin courses with instructor data');
        }
      } catch (instructorError) {
        console.warn('❌ Failed to fetch instructor data for admin course enrichment:', instructorError.message);
        // Set default instructor names for all courses
        courses = courses.map(course => ({
          ...course,
          instructor_name: course.instructor_name || 'Unknown Instructor'
        }));
      }
    }
    
    return courses;
  } catch (error) {
    console.error('🚨 Failed to fetch admin courses:', error);
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' ||
        error.response?.status === 401 || error.response?.status === 403) {
      console.warn('Backend API not available, returning empty courses list');
      // Return empty array instead of mock data
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
      console.warn('Backend API not available, returning empty lessons list');
      // Return empty array instead of mock data
      return [];
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch lessons';
    throw new Error(message);
  }
}

/**
 * Delete a course (admin action)
 * @param {number} courseId - The ID of the course to delete
 * @returns {Promise<Object>} Promise that resolves to delete result
 */
export async function deleteCourse(courseId) {
  try {
    console.warn(`🗑️ Deleting course ${courseId} via API...`);
    const response = await apiClient.delete(`/api/admin/courses/${courseId}`);
    console.warn('✅ Course deletion response:', response.data);
    
    // Handle the API response structure: { success: true, data: {...} }
    if (response.data.success) {
      return response.data;
    }
    
    return response.data || { success: true, message: 'Course deleted successfully' };
  } catch (error) {
    console.error('🚨 Failed to delete course:', error);
    
    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      // Check if it's a route not found vs course not found
      if (error.response?.data?.message?.includes('Course not found') || 
          error.response?.data?.message?.includes('course') ||
          error.response?.data?.error?.includes('course')) {
        throw new Error(`Course with ID ${courseId} not found.`);
      } else {
        throw new Error('Delete course API endpoint not found. Please contact the backend developer to implement the DELETE /api/admin/courses/:id route.');
      }
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login as admin again.');
    } else if (error.response?.status === 403) {
      throw new Error('Forbidden. You do not have permission to delete courses.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred while deleting the course. Please try again later.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.message || 'Invalid request. Please check the course ID.');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to the server. Please check if the backend is running on http://localhost:3002');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to delete course';
    throw new Error(message);
  }
}

/**
 * Delete a lesson (admin action)
 * @param {number} lessonId - The ID of the lesson to delete
 * @returns {Promise<Object>} Promise that resolves to delete result
 */
export async function deleteLesson(lessonId) {
  try {
    console.warn(`🗑️ Deleting lesson ${lessonId} via API...`);
    const response = await apiClient.delete(`/api/admin/lessons/${lessonId}`);
    console.warn('✅ Lesson deletion response:', response.data);
    
    // Handle the API response structure: { success: true, data: {...} }
    if (response.data.success) {
      return response.data;
    }
    
    return response.data || { success: true, message: 'Lesson deleted successfully' };
  } catch (error) {
    console.error('🚨 Failed to delete lesson:', error);
    
    // Handle specific HTTP status codes
    if (error.response?.status === 404) {
      throw new Error('Delete lesson API endpoint not found. Please contact the backend developer to implement the DELETE /api/admin/lessons/:id route.');
    } else if (error.response?.status === 401) {
      throw new Error('Unauthorized. Please login as admin again.');
    } else if (error.response?.status === 403) {
      throw new Error('Forbidden. You do not have permission to delete lessons.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error occurred while deleting the lesson. Please try again later.');
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to the server. Please check if the backend is running on http://localhost:3002');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to delete lesson';
    throw new Error(message);
  }
}

/**
 * Check if admin delete endpoints are available
 * @returns {Promise<Object>} Promise that resolves to endpoint availability status
 */
export async function checkDeleteEndpoints() {
  try {
    const results = {
      courseDeleteAvailable: false,
      lessonDeleteAvailable: false,
      errors: [],
      courseGetAvailable: false
    };
    
    // First check if we can get a course (this should work based on your example)
    try {
      const response = await apiClient.get('/api/admin/courses/1');
      if (response.data.success) {
        results.courseGetAvailable = true;
        console.warn('✅ Course GET endpoint working');
      }
    } catch {
      results.errors.push('Course GET endpoint not working');
    }
    
    // Test course delete endpoint with a course ID that should exist
    try {
      await apiClient.delete('/api/admin/courses/999999'); // Non-existent course ID
      results.courseDeleteAvailable = true;
    } catch (error) {
      if (error.response?.status === 404 && 
          (error.response?.data?.message?.toLowerCase().includes('course not found') ||
           error.response?.data?.message?.toLowerCase().includes('course') ||
           error.response?.data?.error?.toLowerCase().includes('course'))) {
        // This means the endpoint exists but course doesn't - that's good!
        results.courseDeleteAvailable = true;
        console.warn('✅ Course DELETE endpoint exists (course not found is expected)');
      } else if (error.response?.status === 404) {
        // This means the endpoint doesn't exist
        results.errors.push('Course DELETE endpoint not implemented on backend (404 route not found)');
      } else if (error.response?.status === 401) {
        results.errors.push('Course DELETE endpoint exists but requires authentication');
        results.courseDeleteAvailable = true; // Endpoint exists, just need auth
      } else if (error.response?.status === 403) {
        results.errors.push('Course DELETE endpoint exists but requires admin permissions');
        results.courseDeleteAvailable = true; // Endpoint exists, just need permissions
      } else {
        results.errors.push(`Course DELETE endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // Test lesson delete endpoint
    try {
      await apiClient.delete('/api/admin/lessons/999999'); // Non-existent lesson ID
      results.lessonDeleteAvailable = true;
    } catch (error) {
      if (error.response?.status === 404 && 
          (error.response?.data?.message?.toLowerCase().includes('lesson not found') ||
           error.response?.data?.message?.toLowerCase().includes('lesson') ||
           error.response?.data?.error?.toLowerCase().includes('lesson'))) {
        // This means the endpoint exists but lesson doesn't - that's good!
        results.lessonDeleteAvailable = true;
        console.warn('✅ Lesson DELETE endpoint exists (lesson not found is expected)');
      } else if (error.response?.status === 404) {
        // This means the endpoint doesn't exist
        results.errors.push('Lesson DELETE endpoint not implemented on backend (404 route not found)');
      } else if (error.response?.status === 401) {
        results.errors.push('Lesson DELETE endpoint exists but requires authentication');
        results.lessonDeleteAvailable = true; // Endpoint exists, just need auth
      } else if (error.response?.status === 403) {
        results.errors.push('Lesson DELETE endpoint exists but requires admin permissions');
        results.lessonDeleteAvailable = true; // Endpoint exists, just need permissions
      } else {
        results.errors.push(`Lesson DELETE endpoint error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking delete endpoints:', error);
    return {
      courseDeleteAvailable: false,
      lessonDeleteAvailable: false,
      courseGetAvailable: false,
      errors: ['Unable to check endpoint availability: ' + error.message]
    };
  }
}

// Export default object with all functions for easier importing
export default {
  getAdminStats,
  getAllStudents,
  getAllInstructors,
  getAllCoursesAdmin,
  getAllLessonsAdmin,
  deleteCourse,
  deleteLesson,
  checkDeleteEndpoints
};