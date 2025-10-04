// Test script to verify enrollment counts are working
// You can run this in the browser console to test the enrollment count functions

import { getCourseEnrollmentCount, getMultipleCourseEnrollmentCounts } from './src/services/enrollment.js';

async function testEnrollmentCounts() {
  console.log('🧪 Testing enrollment count functions...');
  
  // Test individual course enrollment counts
  const testCourses = [1, 2, 3, 4, 5, 12];
  
  for (let courseId of testCourses) {
    try {
      const count = await getCourseEnrollmentCount(courseId);
      console.log(`📊 Course ${courseId}: ${count} enrolled`);
    } catch (error) {
      console.error(`❌ Failed to get count for course ${courseId}:`, error);
    }
  }
  
  // Test multiple courses at once
  try {
    const counts = await getMultipleCourseEnrollmentCounts(testCourses);
    console.log('📈 Multiple course counts:', counts);
  } catch (error) {
    console.error('❌ Failed to get multiple counts:', error);
  }
}

// Run the test
testEnrollmentCounts();