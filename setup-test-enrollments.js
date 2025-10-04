// Utility script to add sample enrollment data for testing
// This will show students in the admin dashboard based on actual enrollments

console.log('🧪 Adding sample enrollment data for testing...');

// Sample enrollment data that creates students with enrollments
const sampleEnrollments = [
  { id: 1, user_id: 101, course_id: 1, enrolled_at: '2024-01-15', status: 'active', progress: 45, progress_percentage: 45 },
  { id: 2, user_id: 101, course_id: 2, enrolled_at: '2024-01-20', status: 'active', progress: 60, progress_percentage: 60 },
  { id: 3, user_id: 102, course_id: 1, enrolled_at: '2024-01-18', status: 'active', progress: 80, progress_percentage: 80 },
  { id: 4, user_id: 102, course_id: 3, enrolled_at: '2024-01-22', status: 'active', progress: 30, progress_percentage: 30 },
  { id: 5, user_id: 103, course_id: 2, enrolled_at: '2024-01-25', status: 'active', progress: 90, progress_percentage: 90 },
  { id: 6, user_id: 104, course_id: 1, enrolled_at: '2024-01-28', status: 'active', progress: 25, progress_percentage: 25 },
  { id: 7, user_id: 104, course_id: 4, enrolled_at: '2024-02-01', status: 'active', progress: 70, progress_percentage: 70 },
  { id: 8, user_id: 105, course_id: 3, enrolled_at: '2024-02-03', status: 'active', progress: 55, progress_percentage: 55 }
];

// Store in localStorage
localStorage.setItem('enrollments', JSON.stringify(sampleEnrollments));

console.log('✅ Sample enrollment data added!');
console.log('📊 Created enrollments for users: 101, 102, 103, 104, 105');
console.log('🔄 Refresh the admin dashboard to see students with real enrollments');
console.log('🗑️ To clear data: localStorage.removeItem("enrollments")');