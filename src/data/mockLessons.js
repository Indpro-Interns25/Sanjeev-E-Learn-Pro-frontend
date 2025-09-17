export const mockLessons = [
  {
    id: 1,
    courseId: 1,
    title: 'HTML Basics',
    description: 'Introduction to HTML elements and document structure',
    duration: '45 minutes',
    order: 1,
    content: 'Welcome to HTML Basics! In this lesson, you will learn...',
    videoUrl: 'https://example.com/video1',
    resources: [
      { name: 'HTML Cheat Sheet', url: 'https://example.com/html-cheatsheet.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80', // HTML
  },
  {
    id: 2,
    courseId: 1,
    title: 'CSS Fundamentals',
    description: 'Learn about CSS selectors and properties',
    duration: '50 minutes',
    order: 2,
    content: 'CSS is what makes the web beautiful. In this lesson...',
    videoUrl: 'https://example.com/video2',
    resources: [
      { name: 'CSS Reference', url: 'https://example.com/css-reference.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80', // CSS
  },
  // Add more lessons as needed
];

// Track lesson completion status per user
const lessonCompletionStatus = new Map();

export function getLessonsByCourse(courseId) {
  return mockLessons
    .filter(lesson => lesson.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

// Helper function to get a specific lesson
export function getLessonById(lessonId) {
  return mockLessons.find(lesson => lesson.id === lessonId);
}

// Helper function to mark a lesson as complete for a user
export function markLessonComplete(userId, lessonId) {
  const key = `${userId}-${lessonId}`;
  lessonCompletionStatus.set(key, true);
}

// Helper function to check if a lesson is complete
export function isLessonComplete(userId, lessonId) {
  const key = `${userId}-${lessonId}`;
  return lessonCompletionStatus.get(key) || false;
}

// Helper function to get course progress for a user
export function getCourseProgress(userId, courseId) {
  const courseLessons = getLessonsByCourse(courseId);
  const completedLessons = courseLessons.filter(lesson => 
    isLessonComplete(userId, lesson.id)
  );
  
  return {
    total: courseLessons.length,
    completed: completedLessons.length,
    percentage: Math.round((completedLessons.length / courseLessons.length) * 100)
  };
}
