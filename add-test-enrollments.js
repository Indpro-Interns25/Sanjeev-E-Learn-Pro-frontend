// Test script to add enrollments for the logged-in user
// Run this in browser console to test My Learning page

console.warn('🧪 Creating test enrollments for My Learning page...');

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
const userId = currentUser.id || 1;

console.warn('👤 Current user:', currentUser);
console.warn('🆔 Using user ID:', userId);

// Create test enrollments that match actual course IDs
const testEnrollments = [
    {
        id: 1001,
        user_id: userId,
        course_id: 1,  // Introduction to Web Development 
        enrolled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        status: 'active',
        progress: 43  // 43% as shown in screenshot
    },
    {
        id: 1002,
        user_id: userId,
        course_id: 2,  // Advanced React Programming
        enrolled_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        status: 'active',
        progress: 22  // 22% as shown in screenshot
    }
];

// Store in localStorage
localStorage.setItem('enrollments', JSON.stringify(testEnrollments));

console.warn('✅ Test enrollments created:', testEnrollments);
console.warn('🔄 Refresh the page to see enrolled courses in My Learning');

// Optionally refresh the page automatically
if (confirm('Test enrollments added! Refresh page to see changes?')) {
    window.location.reload();
}