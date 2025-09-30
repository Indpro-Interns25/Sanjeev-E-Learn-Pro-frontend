// COMPREHENSIVE TEST: Force create user and enrollments
// Paste this entire script in browser console

console.warn('🧪 COMPREHENSIVE MY LEARNING TEST');

// Step 1: Ensure user exists
const testUser = {
    id: 1,
    name: 'sharana',
    email: 'sharana@test.com',
    role: 'student',
    avatar: null
};

localStorage.setItem('user', JSON.stringify(testUser));
localStorage.setItem('token', 'test-token-' + Date.now());
console.warn('✅ Test user created:', testUser);

// Step 2: Create specific enrollments for this user
const testEnrollments = [
    {
        id: 1001,
        user_id: 1,  // Must match testUser.id
        course_id: 1,  // Course: Introduction to Web Development
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 43
    },
    {
        id: 1002,
        user_id: 1,  // Must match testUser.id
        course_id: 2,  // Course: Advanced React Programming  
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 22
    }
];

localStorage.setItem('enrollments', JSON.stringify(testEnrollments));
console.warn('✅ Test enrollments created:', testEnrollments);

// Step 3: Verify the data
const storedUser = JSON.parse(localStorage.getItem('user'));
const storedEnrollments = JSON.parse(localStorage.getItem('enrollments'));
const userEnrollments = storedEnrollments.filter(e => e.user_id === storedUser.id);

console.warn('🔍 VERIFICATION:');
console.warn('📝 Stored user:', storedUser);
console.warn('📚 Stored enrollments:', storedEnrollments);
console.warn('🎯 User-specific enrollments:', userEnrollments);

// Step 4: Navigate to My Learning
console.warn('🚀 Navigating to My Learning page...');
window.location.href = '/student/my-learning';

// Alternative: If already on My Learning, just refresh
// window.location.reload();