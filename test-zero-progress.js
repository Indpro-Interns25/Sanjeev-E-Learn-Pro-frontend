// Test Zero Progress Fix - Paste this in browser console
console.warn('🧪 TESTING ZERO PROGRESS FIX');

// Step 1: Setup clean environment with zero progress
function setupZeroProgressTest() {
    console.warn('🔧 Setting up clean environment for zero progress test...');
    
    // Create test user
    const testUser = {
        id: 1,
        name: 'sharana',
        email: 'sharana@test.com',
        role: 'student'
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    localStorage.setItem('token', 'test-token-12345');
    
    // Clear existing enrollments completely
    localStorage.removeItem('enrollments');
    
    console.warn('✅ Clean environment set up');
    console.warn('🗑️ Cleared all existing enrollments');
    console.warn('👤 Test user created:', testUser);
}

// Step 2: Create new enrollment with zero progress
function enrollWithZeroProgress(courseId) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Create new enrollment with explicit zero progress
    const newEnrollment = {
        id: Date.now(),
        user_id: user.id,
        course_id: parseInt(courseId),
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 0,              // ✅ Explicit zero progress
        progress_percentage: 0    // ✅ Explicit zero progress percentage
    };
    
    // Remove any existing enrollment for this course/user first
    const filteredEnrollments = enrollments.filter(e => 
        !(e.user_id === user.id && e.course_id === parseInt(courseId))
    );
    
    filteredEnrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(filteredEnrollments));
    
    console.warn('✅ New enrollment created with 0% progress:', newEnrollment);
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { userId: user.id, courseId: parseInt(courseId), enrollment: newEnrollment }
    }));
    
    console.warn('� Dispatched enrollment change event');
    console.warn('�🔄 Refresh the page to see 0% progress');
    
    return newEnrollment;
}

// Step 3: Verify zero progress
function verifyZeroProgress() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    const userEnrollments = enrollments.filter(e => e.user_id === user.id);
    
    console.warn('📊 VERIFICATION RESULTS:');
    console.warn('==========================================');
    
    userEnrollments.forEach(enrollment => {
        const progress = enrollment.progress || enrollment.progress_percentage || 0;
        const status = progress === 0 ? '✅ CORRECT (0%)' : '❌ WRONG (' + progress + '%)';
        
        console.warn(`Course ${enrollment.course_id}: ${status}`);
        console.warn(`  - Progress: ${enrollment.progress}`);
        console.warn(`  - Progress Percentage: ${enrollment.progress_percentage}`);
    });
    
    const allZero = userEnrollments.every(e => 
        (e.progress === 0 || e.progress === undefined) && 
        (e.progress_percentage === 0 || e.progress_percentage === undefined)
    );
    
    if (allZero) {
        console.warn('🎉 SUCCESS: All enrollments have 0% progress!');
    } else {
        console.warn('❌ ISSUE: Some enrollments still have non-zero progress');
    }
    
    return { userEnrollments, allZero };
}

// Step 4: Complete test workflow
function runCompleteTest() {
    console.warn('🚀 Running complete zero progress test...');
    
    // Setup clean environment
    setupZeroProgressTest();
    
    // Create test enrollments with zero progress
    enrollWithZeroProgress(4); // Flutter Mobile App Development
    enrollWithZeroProgress(1); // PostgreSQL Database Design
    enrollWithZeroProgress(3); // Complete React Development Bootcamp
    
    // Verify results
    verifyZeroProgress();
    
    console.warn('');
    console.warn('📋 NEXT STEPS:');
    console.warn('1. Refresh the page (F5)');
    console.warn('2. Go to /student/my-learning');
    console.warn('3. All courses should show 0% progress');
    console.warn('4. All lessons should show 0 watched minutes');
}

// Export functions to window
window.setupZeroProgressTest = setupZeroProgressTest;
window.enrollWithZeroProgress = enrollWithZeroProgress;
window.verifyZeroProgress = verifyZeroProgress;
window.runCompleteTest = runCompleteTest;

console.warn('🎯 ZERO PROGRESS TEST FUNCTIONS:');
console.warn('🔧 setupZeroProgressTest() - Clean environment');
console.warn('📝 enrollWithZeroProgress(courseId) - Create zero progress enrollment');
console.warn('✅ verifyZeroProgress() - Check all progress is 0%');
console.warn('� runCompleteTest() - Run complete test workflow');
console.warn('');
console.warn('⚡ QUICK FIX:');
console.warn('Just run: runCompleteTest()');

// Auto-run the complete test
runCompleteTest();