// Test Enrollment Flow - Paste this in browser console
console.warn('🧪 TESTING ENROLLMENT FLOW');

// Step 1: Set up clean test environment
function setupTestEnvironment() {
    // Create test user
    const testUser = {
        id: 1,
        name: 'sharana',
        email: 'sharana@test.com',
        role: 'student'
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', 'test-token-12345');
    
    // Clear existing enrollments
    localStorage.removeItem('enrollments');
    
    console.warn('✅ Test environment set up:', testUser);
    console.warn('🗑️ Cleared existing enrollments');
}

// Step 2: Check current state
function checkState() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    console.warn('👤 Current user:', user);
    console.warn('📚 Current enrollments:', enrollments);
    
    return { user, enrollments };
}

// Step 3: Simulate enrollment
function simulateEnrollment(courseId) {
    const { user } = checkState();
    if (!user.id) {
        console.warn('❌ No user found. Run setupTestEnvironment() first');
        return null;
    }
    
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    const newEnrollment = {
        id: Date.now(),
        user_id: user.id,
        course_id: parseInt(courseId),
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 0
    };
    
    enrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
    
    console.warn('✅ Simulated enrollment:', newEnrollment);
    console.warn('� Refresh page to see changes in UI');
    return newEnrollment;
}

// Step 4: Check if course is enrolled
function isEnrolled(courseId) {
    const { user, enrollments } = checkState();
    const enrolled = enrollments.some(e => 
        e.user_id === user.id && e.course_id === parseInt(courseId)
    );
    
    console.warn(`📋 Course ${courseId} enrolled:`, enrolled);
    return enrolled;
}

// Step 5: Remove enrollment (for testing)
function removeEnrollment(courseId) {
    const { user } = checkState();
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    const filtered = enrollments.filter(e => 
        !(e.user_id === user.id && e.course_id === parseInt(courseId))
    );
    
    localStorage.setItem('enrollments', JSON.stringify(filtered));
    console.warn(`🗑️ Removed enrollment for course ${courseId}`);
    console.warn('🔄 Refresh page to see changes in UI');
}

// Export functions to window for console use
window.setupTestEnvironment = setupTestEnvironment;
window.checkState = checkState;
window.simulateEnrollment = simulateEnrollment;
window.isEnrolled = isEnrolled;
window.removeEnrollment = removeEnrollment;

console.warn('🎯 TESTING FUNCTIONS AVAILABLE:');
console.warn('🔧 setupTestEnvironment() - Set up clean test user');
console.warn('📋 checkState() - Check current user and enrollments');
console.warn('📝 simulateEnrollment(courseId) - Add test enrollment');
console.warn('❓ isEnrolled(courseId) - Check if course is enrolled');
console.warn('🗑️ removeEnrollment(courseId) - Remove enrollment');
console.warn('');
console.warn('📋 TESTING WORKFLOW:');
console.warn('1. setupTestEnvironment()');
console.warn('2. simulateEnrollment(1) // or any course ID');
console.warn('3. Refresh page');
console.warn('4. Check Course Detail and My Learning pages');

// Auto-setup for immediate testing
setupTestEnvironment();