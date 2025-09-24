export const mockLessons = [
  // Course 1: Introduction to Web Development
  {
    id: 1,
    courseId: 1,
    title: 'HTML Basics and Document Structure',
    description: 'Learn HTML elements, tags, and proper document structure for web pages',
    duration: '45 minutes',
    order: 1,
    content: '<h2>Welcome to HTML Basics!</h2><p>In this lesson, you will learn the fundamentals of HTML including elements, tags, and document structure.</p><ul><li>Understanding HTML syntax and semantics</li><li>Document structure (html, head, body)</li><li>Common HTML elements (headings, paragraphs, links)</li><li>HTML attributes and their usage</li><li>Creating your first HTML page</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    resources: [
      { name: 'HTML Cheat Sheet', url: 'https://example.com/html-cheatsheet.pdf' },
      { name: 'HTML Elements Reference', url: 'https://example.com/html-elements.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    courseId: 1,
    title: 'CSS Fundamentals and Styling',
    description: 'Master CSS selectors, properties, and modern styling techniques',
    duration: '50 minutes',
    order: 2,
    content: '<h2>CSS - Making the Web Beautiful</h2><p>Learn how to style your HTML elements with CSS including selectors, properties, and layout techniques.</p><ul><li>CSS syntax and selectors</li><li>Box model and positioning</li><li>Typography and font styling</li><li>Colors, backgrounds, and gradients</li><li>Flexbox basics</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    resources: [
      { name: 'CSS Properties Reference', url: 'https://example.com/css-reference.pdf' },
      { name: 'Flexbox Guide', url: 'https://example.com/flexbox-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    courseId: 1,
    title: 'JavaScript Basics and DOM Manipulation',
    description: 'Introduction to JavaScript programming and DOM interaction',
    duration: '60 minutes',
    order: 3,
    content: '<h2>JavaScript - Adding Interactivity</h2><p>Learn JavaScript fundamentals and how to make your web pages interactive.</p><ul><li>JavaScript syntax and variables</li><li>Functions and control structures</li><li>DOM selection and manipulation</li><li>Event handling</li><li>Creating interactive elements</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    resources: [
      { name: 'JavaScript Fundamentals Guide', url: 'https://example.com/js-basics.pdf' },
      { name: 'DOM Manipulation Cheat Sheet', url: 'https://example.com/dom-cheatsheet.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    courseId: 1,
    title: 'Responsive Web Design',
    description: 'Create websites that look great on all devices using responsive design principles',
    duration: '55 minutes',
    order: 4,
    content: '<h2>Responsive Design for All Devices</h2><p>Learn how to create websites that adapt to different screen sizes and devices.</p><ul><li>Mobile-first design approach</li><li>CSS Grid and advanced Flexbox</li><li>Media queries and breakpoints</li><li>Responsive images and typography</li><li>Testing across devices</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    resources: [
      { name: 'Responsive Design Guide', url: 'https://example.com/responsive-design.pdf' },
      { name: 'CSS Grid Reference', url: 'https://example.com/css-grid.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    courseId: 1,
    title: 'Building Your First Website Project',
    description: 'Put everything together to build a complete responsive website',
    duration: '90 minutes',
    order: 5,
    content: '<h2>Your First Complete Website</h2><p>Apply everything youve learned to build a professional, responsive website from scratch.</p><ul><li>Project planning and wireframing</li><li>HTML structure and semantic markup</li><li>CSS styling and responsive layout</li><li>JavaScript interactivity</li><li>Testing and deployment basics</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    resources: [
      { name: 'Project Starter Files', url: 'https://example.com/project-starter.zip' },
      { name: 'Deployment Guide', url: 'https://example.com/deployment-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  
  // Course 2: Advanced React Programming
  {
    id: 6,
    courseId: 2,
    title: 'React Hooks Deep Dive',
    description: 'Master useState, useEffect, useContext and advanced hook patterns',
    duration: '75 minutes',
    order: 1,
    content: '<h2>React Hooks Deep Dive</h2><p>Learn advanced React Hooks including useState, useEffect, useContext and custom hooks.</p><ul><li>useState for complex state management</li><li>useEffect lifecycle and cleanup</li><li>useContext for global state</li><li>Custom hooks creation</li><li>Hook rules and best practices</li></ul>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    resources: [
      { name: 'React Hooks Guide', url: 'https://example.com/react-hooks.pdf' },
      { name: 'Custom Hooks Examples', url: 'https://example.com/custom-hooks.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    courseId: 1,
    title: 'Responsive Web Design',
    description: 'Creating responsive layouts with CSS Grid and Flexbox',
    duration: '55 minutes',
    order: 4,
    content: '<h2>Responsive Web Design</h2><p>Master responsive design techniques using modern CSS features.</p>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    resources: [
      { name: 'Responsive Design Checklist', url: 'https://example.com/responsive-checklist.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    courseId: 1,
    title: 'Web Development Best Practices',
    description: 'Industry standards and best practices for web development',
    duration: '40 minutes',
    order: 5,
    content: '<h2>Web Development Best Practices</h2><p>Learn industry standards and best practices for professional web development.</p>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    resources: [
      { name: 'Best Practices Guide', url: 'https://example.com/best-practices.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
  },
  // React Course Lessons
  {
    id: 6,
    courseId: 2,
    title: 'React Hooks Deep Dive',
    description: 'Understanding useState, useEffect, and custom hooks',
    duration: '75 minutes',
    order: 1,
    content: '<h2>React Hooks Deep Dive</h2><p>Master React hooks including useState, useEffect, useContext, and creating custom hooks.</p>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    resources: [
      { name: 'React Hooks Reference', url: 'https://example.com/react-hooks.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 7,
    courseId: 2,
    title: 'Context API and State Management',
    description: 'Managing global state with React Context',
    duration: '60 minutes',
    order: 2,
    content: '<h2>Context API and State Management</h2><p>Learn how to manage application state using React Context API.</p>',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    resources: [
      { name: 'Context API Guide', url: 'https://example.com/context-api.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
  }
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
