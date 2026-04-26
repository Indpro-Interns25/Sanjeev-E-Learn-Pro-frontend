import apiClient from './apiClient';

export async function getPlatformStats() {
  const response = await apiClient.get('/api/stats');
  const payload = response?.data || {};

  return {
    totalUsers: Number(payload.totalUsers ?? payload.users ?? 0),
    totalCourses: Number(payload.totalCourses ?? payload.courses ?? 0),
    averageRating: Number(payload.averageRating ?? payload.rating ?? 0),
  };
}
