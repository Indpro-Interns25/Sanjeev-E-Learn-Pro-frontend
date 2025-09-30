// Test enrollment in browser console
// This script tests enrollment functionality directly

// 1. Mock a logged-in user
const mockUser = {
  id: 1,
  name: 'sharana',
  email: 'sharana@example.com',
  role: 'student'
};

// Store user in localStorage to simulate login
localStorage.setItem('user', JSON.stringify(mockUser));
localStorage.setItem('token', 'mock-token-' + Date.now());

// 2. Test enrollment
async function testEnrollment() {
  console.log('🧪 Testing enrollment...');
  
  // Import enrollment functions (this won't work in this file but shows the process)
  // import { enrollUserInCourse, getUserEnrollments } from './src/services/enrollment.js';
  
  console.log('📝 Simulating enrollment...');
  
  // Simulate enrollment directly in localStorage
  const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
  const newEnrollment = {
    id: Date.now(),
    user_id: 1,
    course_id: 1,
    enrolled_at: new Date().toISOString(),
    status: 'active',
    progress: 25
  };
  
  enrollments.push(newEnrollment);
  localStorage.setItem('enrollments', JSON.stringify(enrollments));
  
  console.log('✅ Test enrollment added:', newEnrollment);
  console.log('📚 All enrollments:', enrollments);
  
  return newEnrollment;
}

console.log('🚀 Run testEnrollment() to test enrollment flow');
console.log('🔍 Check localStorage for enrollments data');

// Export for browser console use
window.testEnrollment = testEnrollment;