import apiClient from './apiClient';

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
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Failed to fetch courses';
    throw new Error(message);
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
    return response.data;
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
  return {
    ...course,
    // Ensure price is a number
    price: parseFloat(course.price) || 0,
    // Ensure rating is a number  
    rating: parseFloat(course.rating) || 0,
    // Handle enrolled count (API may return enrolled_count or enrolled)
    enrolled: parseInt(course.enrolled_count || course.enrolled) || 0,
    // Format instructor data from API structure
    instructor: {
      name: course.instructor_name || 'Unknown Instructor',
      avatar: null // API doesn't provide avatar, use placeholder
    },
    // Format dates
    createdAt: new Date(course.created_at),
    updatedAt: new Date(course.updated_at),
    // Add formatted price
    formattedPrice: `$${parseFloat(course.price || 0).toFixed(2)}`,
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