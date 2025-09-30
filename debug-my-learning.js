// DEBUG: Check what's in localStorage and test enrollment service
// Copy and paste this in browser console to debug

console.warn('🔍 DEBUGGING MY LEARNING ISSUE');

// 1. Check current user
const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
console.warn('👤 Current user in localStorage:', currentUser);

// 2. Check enrollments
const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
console.warn('📚 All enrollments in localStorage:', enrollments);

// 3. Filter enrollments for current user
const userId = currentUser.id;
const userEnrollments = enrollments.filter(e => e.user_id === userId);
console.warn(`📖 Enrollments for user ID ${userId}:`, userEnrollments);

// 4. If no enrollments, create test ones
if (userEnrollments.length === 0) {
    console.warn('❌ No enrollments found! Creating test enrollments...');
    
    const testEnrollments = [
        {
            id: Date.now(),
            user_id: userId,
            course_id: 1,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 43
        },
        {
            id: Date.now() + 1,
            user_id: userId, 
            course_id: 2,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 22
        }
    ];
    
    // Merge with existing enrollments
    const allEnrollments = [...enrollments, ...testEnrollments];
    localStorage.setItem('enrollments', JSON.stringify(allEnrollments));
    
    console.warn('✅ Test enrollments added:', testEnrollments);
    console.warn('🔄 Refresh page to see changes');
    
    // Auto refresh
    setTimeout(() => window.location.reload(), 1000);
} else {
    console.warn('✅ User has enrollments - My Learning should show these courses');
}

// 5. Instructions
console.warn('📝 If My Learning still shows all courses, there might be a code issue');
console.warn('🎯 Expected: Only enrolled courses should appear');