// Cleanup script to remove any demo data from localStorage
console.log('🧹 Cleaning up demo data from localStorage...');

// Remove any demo enrollments from localStorage
const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
console.log('📊 Current localStorage enrollments:', enrollments);

// Keep only enrollments that correspond to real users (IDs: 33, 34, 35, 36, 49, 50, 51, 52, 53)
const realUserIds = [33, 34, 35, 36, 49, 50, 51, 52, 53];
const cleanedEnrollments = enrollments.filter(enrollment => 
  realUserIds.includes(enrollment.user_id)
);

console.log('✅ Cleaned enrollments:', cleanedEnrollments);
localStorage.setItem('enrollments', JSON.stringify(cleanedEnrollments));

// Remove any demo users from localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (user.id && !realUserIds.includes(user.id)) {
  console.log('🚮 Removing demo user from localStorage:', user);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
} else {
  console.log('✅ Current user is valid:', user);
}

// Clear any other potential demo data
const itemsToCheck = ['courses', 'lessons', 'comments', 'progress'];
itemsToCheck.forEach(item => {
  if (localStorage.getItem(item)) {
    console.log(`🚮 Removing ${item} from localStorage`);
    localStorage.removeItem(item);
  }
});

console.log('✅ Demo data cleanup complete!');