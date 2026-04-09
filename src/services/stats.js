import apiClient from './apiClient';

export async function getPlatformStats() {
  const response = await apiClient.get('/stats');
  const payload = response?.data || {};

  return {
    totalUsers: Number(payload.totalUsers || 0),
    totalCourses: Number(payload.totalCourses || 0),
    averageRating: Number(payload.averageRating || 0),
  };
}
