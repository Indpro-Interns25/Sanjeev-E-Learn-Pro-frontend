/**
 * Analytics Service
 * Fetches admin analytics data from the backend API.
 * Falls back to mock data when the backend is unreachable.
 */
import apiClient from './apiClient';

// ─── mock fallback ─────────────────────────────────────────────────────────────
const MOCK = {
  stats: {
    totalUsers: 1240,
    newUsersThisMonth: 87,
    totalRevenue: 284500,   // paise (₹2,845)
    revenueThisMonth: 48000,
    totalEnrollments: 3150,
    enrollmentsThisMonth: 210,
    totalCourses: 42,
    avgCompletion: 68,       // percent
  },
  monthlyRevenue: [
    { month: 'Sep', revenue: 22000 },
    { month: 'Oct', revenue: 31000 },
    { month: 'Nov', revenue: 27000 },
    { month: 'Dec', revenue: 39000 },
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 48000 },
  ],
  enrollmentsByMonth: [
    { month: 'Sep', count: 120 },
    { month: 'Oct', count: 155 },
    { month: 'Nov', count: 130 },
    { month: 'Dec', count: 190 },
    { month: 'Jan', count: 205 },
    { month: 'Feb', count: 210 },
  ],
  topCourses: [
    { title: 'React Masterclass', enrolled: 420, completion: 72 },
    { title: 'Node.js Bootcamp', enrolled: 380, completion: 65 },
    { title: 'Python for Data Science', enrolled: 310, completion: 70 },
    { title: 'UI/UX Design Fundamentals', enrolled: 275, completion: 80 },
    { title: 'DevOps with Docker', enrolled: 195, completion: 58 },
  ],
  usersByRole: { student: 1100, instructor: 95, admin: 45 },
};

// ─── API ────────────────────────────────────────────────────────────────────────

export async function getAnalytics() {
  try {
    const [statsRes, revenueRes, enrollRes, topRes, rolesRes] = await Promise.all([
      apiClient.get('/api/admin/analytics/stats'),
      apiClient.get('/api/admin/analytics/revenue'),
      apiClient.get('/api/admin/analytics/enrollments'),
      apiClient.get('/api/admin/analytics/top-courses'),
      apiClient.get('/api/admin/analytics/users-by-role'),
    ]);
    return {
      stats: statsRes.data,
      monthlyRevenue: revenueRes.data,
      enrollmentsByMonth: enrollRes.data,
      topCourses: topRes.data,
      usersByRole: rolesRes.data,
    };
  } catch {
    return MOCK;
  }
}
