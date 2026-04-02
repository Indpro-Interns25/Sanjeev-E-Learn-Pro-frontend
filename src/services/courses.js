import apiClient from './apiClient';
import { mockCourses } from '../data/mockCourses';

// =========================================
// COURSES API SERVICE
// =========================================

/**
 * Fetch all courses with optional filters
 * @param {Object} filters - Query parameters for filtering courses
 * @param {string} filters.category - Filter by category
 * @param {string} filters.level - Filter by level (beginner, intermediate, advanced)
 * @param {string} filters.search - Search query for title/description
 * @param {boolean} filters.featured - Filter featured courses only
 * @param {string} filters.sortBy - Sort by (rating, price, enrolled_count, created_at)
 * @param {string} filters.sortOrder - Sort order (asc, desc)
 * @param {number} filters.page - Page number for pagination
 * @param {number} filters.limit - Number of courses per page
 * @returns {Promise<Array>} Array of course objects
 */
export async function getAllCourses(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.level) queryParams.append('level', filters.level);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.featured !== undefined) queryParams.append('featured', filters.featured);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/api/courses?${queryString}` : '/api/courses';
    
    const response = await apiClient.get(url);
    
    // Get course data
    let courses = response.data;
    
    // Validate that courses is an array
    if (!Array.isArray(courses)) {
      console.warn('⚠️ API response is not an array, falling back to mock courses');
      courses = mockCourses;
    }
    
    // Check if courses have instructor names, if not, try to fetch instructor data.
    // Important: never hit admin endpoints for public users, otherwise a 401 can cause route redirects.
    const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('adminToken');
    if (hasAdminSession && courses.length > 0 && !courses[0].instructor_name && !courses[0].instructor?.name) {
      console.warn('📚 Courses missing instructor names, attempting to fetch instructor data...');
      
      try {
        // Try to fetch instructors from admin API to match with courses
        const instructorsResponse = await apiClient.get('/api/admin/instructors');
        
        if (instructorsResponse.data.success && instructorsResponse.data.data) {
          const instructors = instructorsResponse.data.data;
          
          // Create a map of instructor ID to instructor data
          const instructorMap = {};
          instructors.forEach(instructor => {
            instructorMap[instructor.id] = instructor;
          });
          
          // Enrich courses with instructor names
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
          
          console.warn('✅ Successfully enriched courses with instructor data');
        }
      } catch (instructorError) {
        console.warn('❌ Failed to fetch instructor data for course enrichment:', instructorError.message);
        // Set default instructor names for all courses
        courses = courses.map(course => ({
          ...course,
          instructor_name: course.instructor_name || 'Unknown Instructor'
        }));
      }
    }
    
    // Apply limit filter if specified
    if (filters.limit) {
      courses = courses.slice(0, filters.limit);
    }
    
    return courses;
  } catch (error) {
    console.warn('⚠️ API request failed, falling back to mock courses:', error.message);
    console.warn('Please ensure your backend server is running at the correct URL for real course data');
    
    // Return mock courses as fallback
    let fallbackCourses = [...mockCourses];
    
    // Apply limit filter if specified
    if (filters.limit) {
      fallbackCourses = fallbackCourses.slice(0, filters.limit);
    }
    
    return fallbackCourses;
  }
}

/**
 * Fetch a single course by ID
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course object
 */
export async function getCourseById(courseId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}`);

    // Support responses like { success: true, data: { ... } } or raw course object
    const courseRaw = response.data && response.data.data ? response.data.data : response.data;

    // Ensure the course is formatted consistently for the UI
    let formatted = formatCourseData(courseRaw || {});

    // If instructor is unknown but we have an instructor_id / user_id, try to enrich from admin instructors
    const instructorId = courseRaw?.instructor_id || courseRaw?.user_id || null;
    const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('adminToken');
    if (hasAdminSession && (formatted.instructor_name === 'Unknown Instructor' || !formatted.instructor_name) && instructorId) {
      try {
        const instructorsResp = await apiClient.get('/api/admin/instructors');
        const instructors = instructorsResp.data && instructorsResp.data.data ? instructorsResp.data.data : instructorsResp.data || [];
        const match = instructors.find(i => i.id === instructorId || String(i.id) === String(instructorId));
        if (match) {
          formatted.instructor_name = match.name || match.username || formatted.instructor_name;
          formatted.instructor = { id: match.id, name: match.name || match.username, email: match.email };
        }
      } catch (e) {
        console.warn('❌ Failed to enrich course instructor via admin API:', e?.message || e);
      }
    }

    return formatted;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch course details';
    throw new Error(message);
  }
}

/**
 * Create a new course (instructor only)
 * @param {Object} courseData - Course data
 * @returns {Promise<Object>} Created course object
 */
export async function createCourse(courseData) {
  try {
    const response = await apiClient.post('/api/courses', courseData);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to create course';
    throw new Error(message);
  }
}

/**
 * Create a new course with thumbnail file upload (instructor only)
 * @param {Object} courseData - Course data (title, description, category, level, price, duration, status)
 * @param {File} thumbnailFile - Thumbnail image file
 * @param {Function} onProgress - Optional progress callback (receives percentage)
 * @returns {Promise<Object>} Created course object
 */
export async function createCourseWithFile(courseData, thumbnailFile, onProgress) {
  try {
    const formData = new FormData();
    
    // Append course data fields
    Object.keys(courseData).forEach(key => {
      if (courseData[key] !== null && courseData[key] !== undefined) {
        formData.append(key, courseData[key]);
      }
    });
    
    // Append thumbnail file if provided
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    const response = await apiClient.post('/api/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to create course';
    throw new Error(message);
  }
}

/**
 * Update an existing course (instructor only)
 * @param {number} courseId - Course ID
 * @param {Object} courseData - Updated course data
 * @returns {Promise<Object>} Updated course object
 */
export async function updateCourse(courseId, courseData) {
  try {
    const response = await apiClient.put(`/api/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to update this course');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to update course';
    throw new Error(message);
  }
}

/**
 * Delete a course (instructor only)
 * @param {number} courseId - Course ID
 * @returns {Promise<void>}
 */
export async function deleteCourse(courseId) {
  try {
    await apiClient.delete(`/api/courses/${courseId}`);
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to delete this course');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to delete course';
    throw new Error(message);
  }
}

/**
 * Get featured courses
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} Array of featured course objects
 */
export async function getFeaturedCourses(limit = 6) {
  try {
    return await getAllCourses({ featured: true, limit, sortBy: 'rating', sortOrder: 'desc' });
  } catch (error) {
    throw error;
  }
}

/**
 * Get popular courses (by enrollment count)
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} Array of popular course objects
 */
export async function getPopularCourses(limit = 10) {
  try {
    return await getAllCourses({ limit, sortBy: 'enrolled_count', sortOrder: 'desc' });
  } catch (error) {
    throw error;
  }
}

/**
 * Get courses by category
 * @param {string} category - Category name
 * @param {number} limit - Number of courses to fetch
 * @returns {Promise<Array>} Array of course objects
 */
export async function getCoursesByCategory(category, limit = 12) {
  try {
    return await getAllCourses({ category, limit, sortBy: 'rating', sortOrder: 'desc' });
  } catch (error) {
    throw error;
  }
}

/**
 * Search courses
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} Array of course objects
 */
export async function searchCourses(query, filters = {}) {
  try {
    return await getAllCourses({ search: query, ...filters });
  } catch (error) {
    throw error;
  }
}

/**
 * Get courses by instructor
 * @param {number} instructorId - Instructor user ID
 * @returns {Promise<Array>} Array of course objects
 */
export async function getCoursesByInstructor(instructorId) {
  try {
    const response = await apiClient.get(`/api/instructors/${instructorId}/courses`);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Instructor not found');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch instructor courses';
    throw new Error(message);
  }
}

/**
 * Get course statistics (for instructors)
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} Course statistics
 */
export async function getCourseStats(courseId) {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/stats`);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found');
    }
    
    if (error.response?.status === 403) {
      throw new Error('You are not authorized to view course statistics');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch course statistics';
    throw new Error(message);
  }
}

/**
 * Get all course categories (extracted from existing courses)
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCourseCategories() {
  try {
    // Fetch all courses to extract categories
    const courses = await getAllCourses();
    
    // Extract unique categories from courses
    const categorySet = new Set();
    courses.forEach(course => {
      if (course.category) {
        categorySet.add(course.category);
      }
    });
    
    // Convert to array and sort alphabetically
    const categories = Array.from(categorySet).sort();
    
    // Return in format expected by components (array of objects with name property)
    return categories.map(category => ({ name: category }));
  } catch (error) {
    console.error('Error extracting categories from courses:', error);
    
    // Return fallback categories based on common categories from the API response
    return [
      { name: 'Web Development' },
      { name: 'Mobile Development' }, 
      { name: 'Data Science' },
      { name: 'Database Management' },
      { name: 'Backend Development' },
      { name: 'Frontend Development' }
    ];
  }
}

/**
 * Helper function to format course data for display
 * @param {Object} course - Raw course object from API
 * @returns {Object} Formatted course object
 */
export function formatCourseData(course) {
  // Extract instructor name from various possible fields
  const instructorName = course.instructor_name || 
                        course.instructor?.name || 
                        course.instructor || 
                        'Unknown Instructor';

  return {
    ...course,
    // Ensure price is a number
    price: parseFloat(course.price) || 0,
    // Ensure rating is a number  
    rating: parseFloat(course.rating) || 0,
    // Handle enrolled count from backend (API may return enrolled_count or enrolled)
    // Only use the actual value from backend, no fallback to demo numbers
    enrolled: parseInt(course.enrolled_count || course.enrolled || 0),
    enrolled_count: parseInt(course.enrolled_count || course.enrolled || 0),
    // Ensure instructor_name is always available for components
    instructor_name: instructorName,
    // Format instructor data from API structure
    instructor: {
      name: instructorName,
      avatar: null // API doesn't provide avatar, use placeholder
    },
    // Format dates
    createdAt: new Date(course.created_at),
    updatedAt: new Date(course.updated_at),
    // Add formatted price for free courses
    formattedPrice: parseFloat(course.price || 0) === 0 || course.price === 'Free' || course.price === 'free' 
      ? 'Free' 
      : `$${parseFloat(course.price).toFixed(2)}`,
    // Add formatted rating
    formattedRating: parseFloat(course.rating || 0).toFixed(1),
  };
}

/**
 * Helper function to format multiple courses
 * @param {Array} courses - Array of course objects
 * @returns {Array} Array of formatted course objects
 */
export function formatCoursesData(courses) {
  return courses.map(formatCourseData);
}

// Export default object with all functions for easier importing
export default {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getFeaturedCourses,
  getPopularCourses,
  getCoursesByCategory,
  searchCourses,
  getCoursesByInstructor,
  getCourseStats,
  getCourseCategories,
  formatCourseData,
  formatCoursesData
};