// Debug script to check enrollment progress issue
// Paste this in browser console to diagnose the 65% progress problem

console.warn('🔍 DEBUGGING ENROLLMENT PROGRESS ISSUE');

function debugEnrollmentProgress() {
    console.warn('='.repeat(50));
    console.warn('📊 CURRENT STATE ANALYSIS');
    console.warn('='.repeat(50));
    
    // Check localStorage data
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    console.warn('👤 Current User:', user);
    console.warn('📚 All Enrollments:', enrollments);
    
    // Find user's enrollments
    const userEnrollments = enrollments.filter(e => e.user_id === user.id);
    console.warn(`📋 User ${user.id} Enrollments:`, userEnrollments);
    
    // Check progress values
    userEnrollments.forEach(enrollment => {
        console.warn(`📈 Course ${enrollment.course_id}:`);
        console.warn(`   - Progress: ${enrollment.progress}`);
        console.warn(`   - Progress Percentage: ${enrollment.progress_percentage}`);
        console.warn(`   - Enrolled At: ${enrollment.enrolled_at}`);
        console.warn(`   - Status: ${enrollment.status}`);
    });
    
    return { user, enrollments, userEnrollments };
}

function fixProgressToZero() {
    console.warn('🔧 FIXING PROGRESS TO ZERO FOR ALL ENROLLMENTS');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Reset all progress to 0 for current user
    const updatedEnrollments = enrollments.map(enrollment => {
        if (enrollment.user_id === user.id) {
            return {
                ...enrollment,
                progress: 0,
                progress_percentage: 0
            };
        }
        return enrollment;
    });
    
    localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
    
    console.warn('✅ All enrollments reset to 0% progress');
    console.warn('🔄 Refresh the page to see changes');
    
    return updatedEnrollments;
}

function createCleanEnrollment(courseId) {
    console.warn(`📝 Creating clean enrollment for course ${courseId}`);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Remove any existing enrollment for this course
    const filteredEnrollments = enrollments.filter(e => 
        !(e.user_id === user.id && e.course_id === parseInt(courseId))
    );
    
    // Create new clean enrollment
    const newEnrollment = {
        id: Date.now(),
        user_id: user.id,
        course_id: parseInt(courseId),
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 0,
        progress_percentage: 0
    };
    
    filteredEnrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(filteredEnrollments));
    
    console.warn('✅ Clean enrollment created:', newEnrollment);
    console.warn('🔄 Refresh the page to see changes');
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('enrollmentChanged', {
        detail: { userId: user.id, courseId: parseInt(courseId), enrollment: newEnrollment }
    }));
    
    return newEnrollment;
}

// Export functions to window
window.debugEnrollmentProgress = debugEnrollmentProgress;
window.fixProgressToZero = fixProgressToZero;
window.createCleanEnrollment = createCleanEnrollment;

console.warn('🎯 DEBUG FUNCTIONS AVAILABLE:');
console.warn('🔍 debugEnrollmentProgress() - Check current state');
console.warn('🔧 fixProgressToZero() - Reset all progress to 0%');
console.warn('📝 createCleanEnrollment(courseId) - Create clean enrollment for specific course');
console.warn('');
console.warn('📋 QUICK FIX WORKFLOW:');
console.warn('1. debugEnrollmentProgress() - See current state');
console.warn('2. fixProgressToZero() - Reset all to 0%');
console.warn('3. Refresh page');
console.warn('4. Or use createCleanEnrollment(4) for specific course');

// Auto-run initial check
debugEnrollmentProgress();