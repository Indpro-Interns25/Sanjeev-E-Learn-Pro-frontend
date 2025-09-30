// Test enrollment data
const enrollments = [
  {
    id: 1,
    user_id: 1,
    course_id: 1,
    enrolled_at: new Date().toISOString(),
    status: 'active',
    progress: 75
  },
  {
    id: 2,
    user_id: 1,
    course_id: 2,
    enrolled_at: new Date().toISOString(),
    status: 'active',
    progress: 30
  }
];

localStorage.setItem('enrollments', JSON.stringify(enrollments));
console.log('Test enrollment data added to localStorage');
location.reload();
