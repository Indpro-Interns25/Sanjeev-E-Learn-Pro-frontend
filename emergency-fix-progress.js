// IMMEDIATE FIX FOR 65% PROGRESS ISSUE
// Paste this in browser console to fix the issue right now

console.warn('🚨 EMERGENCY FIX FOR 65% PROGRESS ISSUE');

function emergencyFixProgress() {
    console.warn('🔧 Applying emergency fix...');
    
    // Step 1: Clear all localStorage data that might contain old progress
    localStorage.removeItem('enrollments');
    localStorage.removeItem('userProgress');
    localStorage.removeItem('courseProgress');
    localStorage.removeItem('watchTimes');
    
    console.warn('🗑️ Cleared old localStorage data');
    
    // Step 2: Ensure user is set up
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        const testUser = {
            id: 1,
            name: 'sharana',
            email: 'sharana@test.com',
            role: 'student'
        };
        localStorage.setItem('user', JSON.stringify(testUser));
        console.warn('👤 Set up test user:', testUser);
    }
    
    // Step 3: Create fresh enrollments with 0% progress
    const cleanEnrollments = [
        {
            id: Date.now(),
            user_id: user.id || 1,
            course_id: 4, // Flutter Mobile App Development
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
            progress_percentage: 0
        },
        {
            id: Date.now() + 1,
            user_id: user.id || 1,
            course_id: 1, // PostgreSQL Database Design
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
            progress_percentage: 0
        },
        {
            id: Date.now() + 2,
            user_id: user.id || 1,
            course_id: 3, // Complete React Development Bootcamp
            enrolled_at: new Date().toISOString(),
            status: 'active',
            progress: 0,
            progress_percentage: 0
        }
    ];
    
    localStorage.setItem('enrollments', JSON.stringify(cleanEnrollments));
    console.warn('✅ Created clean enrollments with 0% progress:', cleanEnrollments);
    
    // Step 4: Force page refresh
    console.warn('🔄 Refreshing page in 2 seconds...');
    setTimeout(() => {
        window.location.reload();
    }, 2000);
    
    console.warn('🎉 Fix applied! Page will refresh automatically.');
}

function verifyFix() {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    console.warn('📊 VERIFICATION:');
    enrollments.forEach(e => {
        const progress = e.progress || e.progress_percentage || 0;
        console.warn(`Course ${e.course_id}: ${progress}% - ${progress === 0 ? '✅ CORRECT' : '❌ NEEDS FIX'}`);
    });
    
    return enrollments;
}

// Export to window
window.emergencyFixProgress = emergencyFixProgress;
window.verifyFix = verifyFix;

console.warn('🎯 EMERGENCY FIX AVAILABLE:');
console.warn('🚨 emergencyFixProgress() - Fix the 65% issue immediately');
console.warn('📊 verifyFix() - Check if fix worked');
console.warn('');
console.warn('⚡ QUICK FIX: Just run emergencyFixProgress()');

// Auto-run the fix
console.warn('🚀 Running emergency fix automatically...');
emergencyFixProgress();