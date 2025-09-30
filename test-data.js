// Add test enrollment data to localStorage
// Run this in browser console to simulate enrollments

function addTestEnrollments() {
    const testEnrollments = [
        {
            id: 1,
            user_id: 1,
            course_id: 1,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 25
        },
        {
            id: 2,
            user_id: 1,
            course_id: 2,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 50
        }
    ];
    
    localStorage.setItem('enrollments', JSON.stringify(testEnrollments));
    console.warn('✅ Test enrollments added:', testEnrollments);
    
    // Also add test user
    const testUser = {
        id: 1,
        name: 'sharana',
        email: 'sharana@example.com',
        role: 'student',
        avatar: null
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', 'test-token-' + Date.now());
    
    console.warn('✅ Test user added:', testUser);
    console.warn('🔄 Please refresh the page to see changes');
}

// Run this function in browser console
console.warn('🧪 Run addTestEnrollments() to add test data');
window.addTestEnrollments = addTestEnrollments;