// reports.js - API service for reports and analytics
import apiClient from './apiClient';

// Get course performance analytics
export const getCourseAnalytics = async () => {
  try {
    const response = await apiClient.get('/api/admin/reports/courses');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching course analytics:', error);
    
    // Return empty data when endpoint is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️  Course analytics endpoint not available. Returning empty data.');
      console.warn('⚠️  Please implement: GET /api/admin/reports/courses');
      console.warn('⚠️  Expected response: { most_popular_course: string, average_completion_rate: number, total_courses: number, active_courses: number }');
      
      return {
        most_popular_course: null,
        average_completion_rate: 0,
        total_courses: 0,
        active_courses: 0
      };
    }
    
    throw error;
  }
};

// Get user engagement analytics  
export const getUserEngagementAnalytics = async () => {
  try {
    const response = await apiClient.get('/api/admin/reports/users');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user engagement analytics:', error);
    
    // Return empty data when endpoint is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️  User engagement endpoint not available. Returning empty data.');
      console.warn('⚠️  Please implement: GET /api/admin/reports/users');
      console.warn('⚠️  Expected response: { active_users_this_month: number, new_enrollments_this_month: number, total_users: number, user_growth_rate: number }');
      
      return {
        active_users_this_month: 0,
        new_enrollments_this_month: 0,
        total_users: 0,
        user_growth_rate: 0
      };
    }
    
    throw error;
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async () => {
  try {
    const response = await apiClient.get('/api/admin/reports/revenue');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching revenue analytics:', error);
    
    // Return empty data when endpoint is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️  Revenue analytics endpoint not available. Returning empty data.');
      console.warn('⚠️  Please implement: GET /api/admin/reports/revenue');
      console.warn('⚠️  Expected response: { total_revenue: number, monthly_revenue: number, revenue_growth: number, top_earning_course: string }');
      
      return {
        total_revenue: 0,
        monthly_revenue: 0,
        revenue_growth: 0,
        top_earning_course: null
      };
    }
    
    throw error;
  }
};

// Get enrollment trends
export const getEnrollmentTrends = async () => {
  try {
    const response = await apiClient.get('/api/admin/reports/enrollments');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching enrollment trends:', error);
    
    // Return empty data when endpoint is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️  Enrollment trends endpoint not available. Returning empty data.');
      console.warn('⚠️  Please implement: GET /api/admin/reports/enrollments');
      console.warn('⚠️  Expected response: { monthly_enrollments: array, completion_rates: array, popular_courses: array }');
      
      return {
        monthly_enrollments: [],
        completion_rates: [],
        popular_courses: []
      };
    }
    
    throw error;
  }
};

// Get system performance metrics
export const getSystemMetrics = async () => {
  try {
    const response = await apiClient.get('/api/admin/reports/system');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching system metrics:', error);
    
    // Return empty data when endpoint is not available
    if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
      console.warn('⚠️  System metrics endpoint not available. Returning empty data.');
      console.warn('⚠️  Please implement: GET /api/admin/reports/system');
      console.warn('⚠️  Expected response: { server_uptime: string, total_api_calls: number, average_response_time: number, error_rate: number }');
      
      return {
        server_uptime: 'No data available',
        total_api_calls: 0,
        average_response_time: 0,
        error_rate: 0
      };
    }
    
    throw error;
  }
};

export default {
  getCourseAnalytics,
  getUserEngagementAnalytics,
  getRevenueAnalytics,
  getEnrollmentTrends,
  getSystemMetrics
};