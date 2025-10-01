// Test Catalog Filtering - Paste this in browser console
console.warn('🧪 TESTING CATALOG FILTERING');

// Step 1: Setup test environment
function setupCatalogTest() {
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
    
    console.warn('✅ Test environment set up for catalog filtering');
    console.warn('🗑️ Cleared existing enrollments');
}

// Step 2: Test enrollment impact on catalog
function testCatalogFiltering() {
    console.warn('📋 STEP 1: Check catalog - should show all courses');
    console.warn('➡️ Go to /catalog and count courses');
    
    // Simulate enrollment
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Enroll in first two courses
    const newEnrollments = [
        {
            id: Date.now(),
            user_id: 1,
            course_id: 1,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 0
        },
        {
            id: Date.now() + 1,
            user_id: 1,
            course_id: 2,
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 0
        }
    ];
    
    enrollments.push(...newEnrollments);
    localStorage.setItem('enrollments', JSON.stringify(enrollments));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { userId: 1, courseId: 1 }
    }));
    
    console.warn('✅ Enrolled in courses 1 and 2');
    console.warn('📋 STEP 2: Refresh catalog page - courses 1 and 2 should be hidden');
    console.warn('📚 STEP 3: Check My Learning - courses 1 and 2 should appear there');
    
    console.warn('🔄 REFRESH THE PAGE TO SEE CHANGES');
}

// Step 3: Reset for new test
function resetCatalogTest() {
    localStorage.removeItem('enrollments');
    console.warn('🗑️ Reset - removed all enrollments');
    console.warn('🔄 Refresh page to see all courses again');
}

// Export functions
window.setupCatalogTest = setupCatalogTest;
window.testCatalogFiltering = testCatalogFiltering;
window.resetCatalogTest = resetCatalogTest;

console.warn('🎯 CATALOG FILTERING TEST FUNCTIONS:');
console.warn('🔧 setupCatalogTest() - Clean environment');
console.warn('📋 testCatalogFiltering() - Enroll and test filtering');
console.warn('🗑️ resetCatalogTest() - Clear enrollments');
console.warn('');
console.warn('📋 TESTING WORKFLOW:');
console.warn('1. Go to /catalog - count total courses');
console.warn('2. setupCatalogTest()');
console.warn('3. testCatalogFiltering()');
console.warn('4. Refresh page');
console.warn('5. Check /catalog - should have 2 fewer courses');
console.warn('6. Check /student/my-learning - should show 2 enrolled courses');

// Auto-setup
setupCatalogTest();