export const mockLessons = [
  // Course 1: Introduction to Web Development
  {
    id: 1,
    courseId: 1,
    title: 'HTML Fundamentals and Document Structure',
    description: 'Learn HTML elements, tags, and how to structure web documents',
    duration: '45 minutes',
    order: 1,
    content: 'Welcome to HTML Fundamentals! In this lesson, you will learn about HTML elements, document structure, semantic HTML, and best practices for creating web pages.',
    videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
    resources: [
      { name: 'HTML Cheat Sheet', url: 'https://example.com/html-cheatsheet.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    courseId: 1,
    title: 'CSS Styling and Layout Techniques',
    description: 'Master CSS selectors, properties, flexbox, and grid layouts',
    duration: '24 minutes',
    order: 2,
    content: 'CSS is what makes the web beautiful. Learn about selectors, the box model, flexbox, CSS grid, and responsive design techniques.',
    videoUrl: 'https://www.youtube.com/watch?v=i1FeOOhNnwU',
    resources: [
      { name: 'CSS Reference', url: 'https://example.com/css-reference.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    courseId: 1,
    title: 'JavaScript Programming Basics',
    description: 'Introduction to JavaScript variables, functions, and DOM manipulation',
    duration: '60 minutes',
    order: 3,
    content: 'JavaScript brings interactivity to web pages. Learn variables, functions, arrays, objects, and how to manipulate the DOM.',
    videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    resources: [
      { name: 'JavaScript Guide', url: 'https://example.com/js-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    courseId: 1,
    title: 'Responsive Web Design',
    description: 'Create mobile-friendly websites using responsive design principles',
    duration: '24 minutes',
    order: 4,
    content: 'Learn how to make websites work perfectly on all devices using media queries, flexible layouts, and mobile-first design.',
    videoUrl: 'https://www.youtube.com/watch?v=l04dDYW-QaI&t=7s',
    resources: [
      { name: 'Responsive Design Guide', url: 'https://example.com/responsive-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    courseId: 1,
    title: 'Building Your First Website Project',
    description: 'Put everything together by building a complete, responsive website',
    duration: '120 minutes',
    order: 5,
    content: 'Apply all your HTML, CSS, and JavaScript knowledge to build a professional portfolio website from scratch.',
    videoUrl: 'https://www.youtube.com/watch?v=FazgJVnrVuI',
    resources: [
      { name: 'Project Template', url: 'https://example.com/project-template.zip' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },

  // Course 2: Advanced React Programming
  {
    id: 6,
    courseId: 2,
    title: 'React Hooks and Functional Components',
    description: 'Master useState, useEffect, and custom hooks in React',
    duration: '59 minutes',
    order: 1,
    content: 'Deep dive into React hooks, functional components, and modern React patterns for building efficient applications.',
    videoUrl: 'https://www.youtube.com/watch?v=HnXPKtro4SM',
    resources: [
      { name: 'React Hooks Guide', url: 'https://example.com/react-hooks.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 7,
    courseId: 2,
    title: 'Context API and State Management',
    description: 'Global state management using React Context API',
    duration: '35 minutes',
    order: 2,
    content: 'Learn how to manage global state in React applications using Context API and custom providers.',
    videoUrl: 'https://www.youtube.com/watch?v=gQ_l-1zpVBo',
    resources: [
      { name: 'Context API Reference', url: 'https://example.com/context-api.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 8,
    courseId: 2,
    title: 'Performance Optimization Techniques',
    description: 'Optimize React applications for better performance',
    duration: '11 minutes',
    order: 3,
    content: 'Learn React performance optimization techniques including memoization, lazy loading, and code splitting.',
    videoUrl: 'https://www.youtube.com/watch?v=CaShN6mCJB0',
    resources: [
      { name: 'Performance Guide', url: 'https://example.com/performance.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 9,
    courseId: 2,
    title: 'Testing React Applications',
    description: 'Unit and integration testing for React components',
    duration: '70 minutes',
    order: 4,
    content: 'Learn how to test React components effectively using Jest, React Testing Library, and modern testing practices.',
    videoUrl: 'https://www.youtube.com/watch?v=8Xwq35cPwYg',
    resources: [
      { name: 'Testing Guide', url: 'https://example.com/testing.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },

  // Course 3: Python for Data Science
  {
    id: 10,
    courseId: 3,
    title: 'Python Basics for Data Science',
    description: 'Python fundamentals focused on data science applications',
    duration: '70 minutes',
    order: 1,
    content: 'Learn Python basics specifically for data science, including data types, control structures, and functions.',
    videoUrl: 'https://www.youtube.com/watch?v=HrRA67O-QXI',
    resources: [
      { name: 'Python Data Science Guide', url: 'https://example.com/python-ds.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 11,
    courseId: 3,
    title: 'NumPy Arrays and Mathematical Operations',
    description: 'Master NumPy for numerical computing in Python',
    duration: '15 minutes',
    order: 2,
    content: 'Dive deep into NumPy arrays, mathematical operations, and numerical computing fundamentals.',
    videoUrl: 'https://www.youtube.com/watch?v=a8aDcLk4vRc',
    resources: [
      { name: 'NumPy Reference', url: 'https://example.com/numpy-ref.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 12,
    courseId: 3,
    title: 'Pandas DataFrames and Data Manipulation',
    description: 'Data manipulation and analysis using Pandas library',
    duration: '25 minutes',
    order: 3,
    content: 'Master Pandas DataFrames for data cleaning, manipulation, and analysis in real-world scenarios.',
    videoUrl: 'https://www.youtube.com/watch?v=F6kmIpWWEdU',
    resources: [
      { name: 'Pandas Cheat Sheet', url: 'https://example.com/pandas-cheat.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 13,
    courseId: 3,
    title: 'Data Visualization with Matplotlib',
    description: 'Create compelling visualizations using Matplotlib and Seaborn',
    duration: '50 minutes',
    order: 4,
    content: 'Learn to create professional data visualizations using Matplotlib and Seaborn libraries.',
    videoUrl: 'https://www.youtube.com/watch?v=xXibS9832FM',
    resources: [
      { name: 'Visualization Guide', url: 'https://example.com/viz-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 14,
    courseId: 3,
    title: 'Real-world Data Analysis Projects',
    description: 'Apply your skills to complete data analysis projects',
    duration: '44 minutes',
    order: 5,
    content: 'Work on real-world data analysis projects to solidify your Python data science skills.',
    videoUrl: 'https://www.youtube.com/watch?v=KgCgpCIOkIs',
    resources: [
      { name: 'Project Datasets', url: 'https://example.com/datasets.zip' }
    ],
    image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=400&q=80',
  },

  // Course 4: Machine Learning Fundamentals
  {
    id: 15,
    courseId: 4,
    title: 'Introduction to Machine Learning',
    description: 'Fundamentals of machine learning concepts and applications',
    duration: '50 minutes',
    order: 1,
    content: 'Introduction to machine learning concepts, types of learning, and real-world applications.',
    videoUrl: 'https://www.youtube.com/watch?v=h0e2HAPTGF4',
    resources: [
      { name: 'ML Fundamentals', url: 'https://example.com/ml-fundamentals.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 16,
    courseId: 4,
    title: 'Data Preprocessing and Feature Engineering',
    description: 'Prepare and transform data for machine learning models',
    duration: '15 minutes',
    order: 2,
    content: 'Learn data preprocessing techniques, feature engineering, and data cleaning for ML projects.',
    videoUrl: 'https://www.youtube.com/watch?v=vZDDmULsCUU',
    resources: [
      { name: 'Preprocessing Guide', url: 'https://example.com/preprocessing.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 17,
    courseId: 4,
    title: 'Linear and Logistic Regression',
    description: 'Understand and implement regression algorithms',
    duration: '37 minutes',
    order: 3,
    content: 'Deep dive into linear and logistic regression algorithms with practical implementations.',
    videoUrl: 'https://www.youtube.com/watch?v=QWYkQDvCo4Y',
    resources: [
      { name: 'Regression Guide', url: 'https://example.com/regression.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 18,
    courseId: 4,
    title: 'Decision Trees and Random Forests',
    description: 'Learn tree-based machine learning algorithms',
    duration: '20 minutes',
    order: 4,
    content: 'Master decision trees and ensemble methods like Random Forests for classification and regression.',
    videoUrl: 'https://www.youtube.com/watch?v=_L39rN6gz7Y',
    resources: [
      { name: 'Tree Algorithms', url: 'https://example.com/trees.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 19,
    courseId: 4,
    title: 'Clustering Algorithms',
    description: 'Unsupervised learning with clustering techniques',
    duration: '10 minutes',
    order: 5,
    content: 'Learn clustering algorithms like K-means and hierarchical clustering for unsupervised learning.',
    videoUrl: 'https://www.youtube.com/watch?v=RDZUdRSDOok',
    resources: [
      { name: 'Clustering Guide', url: 'https://example.com/clustering.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 20,
    courseId: 4,
    title: 'Model Evaluation and Validation',
    description: 'Evaluate and validate machine learning models effectively',
    duration: '65 minutes',
    order: 6,
    content: 'Learn model evaluation metrics, cross-validation, and techniques to avoid overfitting.',
    videoUrhttps:'https://www.youtube.com/watch?v=v6DtYYafrWQ',
    resources: [
      { name: 'Evaluation Metrics', url: 'https://example.com/evaluation.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },

  // Course 5: Node.js Backend Development
  {
    id: 21,
    courseId: 5,
    title: 'Node.js Fundamentals and NPM',
    description: 'Getting started with Node.js and package management',
    duration: '20 minutes',
    order: 1,
    content: 'Introduction to Node.js, NPM package manager, and setting up your development environment.',
    videoUrl: 'https://www.youtube.com/watch?v=nSFe1-kpfbQ',
    resources: [
      { name: 'Node.js Guide', url: 'https://example.com/nodejs-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 22,
    courseId: 5,
    title: 'Express.js Framework and Routing',
    description: 'Build web servers with Express.js framework',
    duration: '36 minutes',
    order: 2,
    content: 'Learn Express.js framework, routing, middleware, and building RESTful APIs.',
    videoUrl: 'https://www.youtube.com/watch?v=SccSCuHhOw0',
    resources: [
      { name: 'Express.js Reference', url: 'https://example.com/express-ref.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 23,
    courseId: 5,
    title: 'MongoDB and Mongoose ODM',
    description: 'Database operations with MongoDB and Mongoose',
    duration: '25 minutes',
    order: 3,
    content: 'Master MongoDB database operations and Mongoose ODM for data modeling and queries.',
    videoUrl: 'https://www.youtube.com/watch?v=bALyYC10ABw',
    resources: [
      { name: 'MongoDB Guide', url: 'https://example.com/mongodb.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 24,
    courseId: 5,
    title: 'RESTful API Development',
    description: 'Design and build RESTful APIs with best practices',
    duration: '58 minutes',
    order: 4,
    content: 'Learn RESTful API design principles, HTTP methods, status codes, and API documentation.',
    videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
    resources: [
      { name: 'API Design Guide', url: 'https://example.com/api-design.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 25,
    courseId: 5,
    title: 'Authentication and Authorization',
    description: 'Implement secure authentication and authorization systems',
    duration: '39 minutes',
    order: 5,
    content: 'Build secure authentication systems using JWT tokens, bcrypt, and authorization middleware.',
    videoUrl: 'https://www.youtube.com/watch?v=OWeruyqhiTo',
    resources: [
      { name: 'Security Guide', url: 'https://example.com/security.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
  },

  // Course 6: Mobile App Development with React Native
  {
    id: 26,
    courseId: 6,
    title: 'React Native Setup and Environment',
    description: 'Set up React Native development environment',
    duration: '11 minutes',
    order: 1,
    content: 'Install and configure React Native development environment for iOS and Android.',
    videoUrl: 'https://www.youtube.com/watch?v=r0oBuQsYta0',
    resources: [
      { name: 'Setup Guide', url: 'https://example.com/rn-setup.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 27,
    courseId: 6,
    title: 'Navigation and Screen Management',
    description: 'Implement navigation between screens in React Native',
    duration: '10 minutes',
    order: 2,
    content: 'Learn React Navigation for stack, tab, and drawer navigation patterns in mobile apps.',
    videoUrl: 'https://www.youtube.com/watch?v=HuwQwNDLaJ8',
    resources: [
      { name: 'Navigation Guide', url: 'https://example.com/navigation.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 28,
    courseId: 6,
    title: 'Components and Styling',
    description: 'Build and style React Native components',
    duration: '185 minutes',
    order: 3,
    content: 'Master React Native components, StyleSheet, Flexbox layout, and responsive design.',
    videoUrl: 'https://www.youtube.com/watch?v=K7ghUiXLef8',
    resources: [
      { name: 'Styling Guide', url: 'https://example.com/rn-styling.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 29,
    courseId: 6,
    title: 'State Management with Redux',
    description: 'Manage app state using Redux in React Native',
    duration: '80 minutes',
    order: 4,
    content: 'Implement Redux for global state management in React Native applications.',
    videoUrl: 'https://www.youtube.com/watch?v=poQXNp9ItL4',
    resources: [
      { name: 'Redux Guide', url: 'https://example.com/redux-rn.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 30,
    courseId: 6,
    title: 'Native Device Features',
    description: 'Access camera, GPS, storage, and other device features',
    duration: '80 minutes',
    order: 5,
    content: 'Integrate native device features like camera, location, push notifications, and local storage.',
    videoUrl: 'https://www.youtube.com/watch?v=tI_-ZOYqqQU',
    resources: [
      { name: 'Device APIs', url: 'https://example.com/device-apis.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 31,
    courseId: 6,
    title: 'App Store Deployment',
    description: 'Deploy your React Native app to app stores',
    duration: '20 minutes',
    order: 6,
    content: 'Learn the complete process of deploying React Native apps to Google Play Store and Apple App Store.',
    videoUrl: 'https://www.youtube.com/watch?v=jKETjGYxVuQ',
    resources: [
      { name: 'Deployment Guide', url: 'https://example.com/deployment.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },

  // Course 7: Digital Marketing Masterclass
  {
    id: 32,
    courseId: 7,
    title: 'Digital Marketing Fundamentals',
    description: 'Introduction to digital marketing concepts and strategies',
    duration: '15 minutes',
    order: 1,
    content: 'Learn the fundamentals of digital marketing, channels, and strategic planning.',
    videoUrl: 'https://www.youtube.com/watch?v=dS0PtshQDls',
    resources: [
      { name: 'Marketing Strategy Guide', url: 'https://example.com/marketing-strategy.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 33,
    courseId: 7,
    title: 'Search Engine Optimization (SEO)',
    description: 'Master SEO techniques for better search rankings',
    duration: '38 minutes',
    order: 2,
    content: 'Learn on-page and off-page SEO, keyword research, and technical SEO best practices.',
    videoUrl: 'https://www.youtube.com/watch?v=5Zz8VbFixOI',
    resources: [
      { name: 'SEO Checklist', url: 'https://example.com/seo-checklist.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 34,
    courseId: 7,
    title: 'Social Media Marketing Strategies',
    description: 'Effective social media marketing across platforms',
    duration: '25 minutes',
    order: 3,
    content: 'Master social media marketing strategies for Facebook, Instagram, Twitter, LinkedIn, and TikTok.',
    videoUrl:'https://www.youtube.com/watch?v=hCJGFdGBP5o',
    resources: [
      { name: 'Social Media Templates', url: 'https://example.com/social-templates.zip' }
    ],
    image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 35,
    courseId: 7,
    title: 'Pay-Per-Click (PPC) Advertising',
    description: 'Master Google Ads and Facebook advertising',
    duration: '7 minutes',
    order: 4,
    content: 'Learn PPC advertising strategies, campaign optimization, and ROI maximization.',
    videoUrl: 'https://www.youtube.com/watch?v=1Vatp8VLGcs',
    resources: [
      { name: 'PPC Campaign Guide', url: 'https://example.com/ppc-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 36,
    courseId: 7,
    title: 'Analytics and Performance Tracking',
    description: 'Measure and optimize marketing performance',
    duration: '15 minutes',
    order: 5,
    content: 'Master Google Analytics, conversion tracking, and marketing performance measurement.',
    videoUrl: 'https://www.youtube.com/watch?v=_rm4SNmhDXA',
    resources: [
      { name: 'Analytics Dashboard', url: 'https://example.com/analytics-dashboard.xlsx' }
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
  },

  // Course 8: UI/UX Design Principles
  {
    id: 37,
    courseId: 8,
    title: 'Design Thinking and User Research',
    description: 'Understanding users and design thinking methodology',
    duration: '15 minutes',
    order: 1,
    content: 'Learn design thinking process, user research methods, and persona development.',
    videoUrl: 'https://www.youtube.com/watch?v=bAARmsv1tms',
    resources: [
      { name: 'Design Thinking Guide', url: 'https://example.com/design-thinking.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 38,
    courseId: 8,
    title: 'Wireframing and Prototyping',
    description: 'Create wireframes and interactive prototypes',
    duration: '5 minutes',
    order: 2,
    content: 'Master wireframing techniques and create interactive prototypes for user testing.',
    videoUrl: 'https://www.youtube.com/watch?v=D4NyQ5iOMF0',
    resources: [
      { name: 'Wireframe Templates', url: 'https://example.com/wireframes.zip' }
    ],
    image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 39,
    courseId: 8,
    title: 'Visual Design Principles',
    description: 'Color theory, typography, and visual hierarchy',
    duration: '27 minutes',
    order: 3,
    content: 'Learn color theory, typography, layout principles, and visual design fundamentals.',
    videoUrl: 'https://www.youtube.com/watch?v=_g87p1T4V1s',
    resources: [
      { name: 'Design Principles Guide', url: 'https://example.com/design-principles.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 40,
    courseId: 8,
    title: 'Figma and Adobe XD Mastery',
    description: 'Master design tools for professional UI/UX design',
    duration: '10 minutes',
    order: 4,
    content: 'Become proficient in Figma and Adobe XD for professional design work and collaboration.',
    videoUrl: 'https://www.youtube.com/watch?v=Hbn1SMUs-hs',
    resources: [
      { name: 'Design System Templates', url: 'https://example.com/design-system.fig' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 41,
    courseId: 8,
    title: 'Usability Testing and Iteration',
    description: 'Test designs and iterate based on user feedback',
    duration: '8 minutes',
    order: 5,
    content: 'Learn usability testing methods and how to iterate designs based on user feedback.',
    videoUrl: 'https://www.youtube.com/watch?v=MBe0dtkN0Uc',
    resources: [
      { name: 'Testing Checklist', url: 'https://example.com/usability-testing.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
  },

  // Course 9: Advanced JavaScript ES6+
  {
    id: 42,
    courseId: 9,
    title: 'ES6+ Syntax and Features',
    description: 'Modern JavaScript syntax and features',
    duration: '55 minutes',
    order: 1,
    content: 'Master ES6+ features including arrow functions, destructuring, template literals, and spread operator.',
    videoUrl: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
    resources: [
      { name: 'ES6+ Cheat Sheet', url: 'https://example.com/es6-cheat.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 43,
    courseId: 9,
    title: 'Promises and Async/Await',
    description: 'Asynchronous JavaScript programming',
    duration: '75 minutes',
    order: 2,
    content: 'Master asynchronous JavaScript with promises, async/await, and error handling.',
    videoUrl: 'https://www.youtube.com/watch?v=d3jXofmQm44',
    resources: [
      { name: 'Async JavaScript Guide', url: 'https://example.com/async-js.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 44,
    courseId: 9,
    title: 'Modules and Module Bundlers',
    description: 'JavaScript modules and build tools',
    duration: '48 minutes',
    order: 3,
    content: 'Learn ES6 modules, import/export, and modern build tools like Webpack and Vite.',
    videoUrl: 'https://www.youtube.com/watch?v=KeBxopnhizw',
    resources: [
      { name: 'Module System Guide', url: 'https://example.com/modules.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 45,
    courseId: 9,
    title: 'Advanced Array and Object Methods',
    description: 'Master array and object manipulation methods',
    duration: '60 minutes',
    order: 4,
    content: 'Deep dive into advanced array methods and object manipulation techniques in JavaScript.',
    videoUrl: 'https://www.youtube.com/watch?v=N-O4w6PynGY',
    resources: [
      { name: 'Array Methods Reference', url: 'https://example.com/array-methods.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 46,
    courseId: 9,
    title: 'Functional Programming Concepts',
    description: 'Functional programming principles in JavaScript',
    duration: '70 minutes',
    order: 5,
    content: 'Learn functional programming concepts including higher-order functions, immutability, and pure functions.',
    videoUrl: 'https://www.youtube.com/watch?v=j1laALb8OVM',
    resources: [
      { name: 'Functional JS Guide', url: 'https://example.com/functional-js.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },

  // Course 10: Cybersecurity Fundamentals
  {
    id: 47,
    courseId: 10,
    title: 'Cybersecurity Fundamentals and Threats',
    description: 'Introduction to cybersecurity and common threats',
    duration: '80 minutes',
    order: 1,
    content: 'Learn cybersecurity basics, threat landscape, and fundamental security principles.',
    videoUrl: 'https://www.youtube.com/watch?v=34BtwcL7Mkg',
    resources: [
      { name: 'Security Basics Guide', url: 'https://example.com/security-basics.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 48,
    courseId: 10,
    title: 'Network Security and Firewalls',
    description: 'Network security principles and firewall configuration',
    duration: '65 minutes',
    order: 2,
    content: 'Master network security concepts, firewall configuration, and intrusion detection systems.',
    videoUrl: 'https://www.youtube.com/watch?v=NIRXtMg-0z8',
    resources: [
      { name: 'Network Security Guide', url: 'https://example.com/network-security.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 49,
    courseId: 10,
    title: 'Ethical Hacking and Penetration Testing',
    description: 'Introduction to ethical hacking and penetration testing',
    duration: '35 minutes',
    order: 3,
    content: 'Learn ethical hacking methodologies, penetration testing techniques, and vulnerability assessment.',
    videoUrl: 'https://www.youtube.com/watch?v=-e_eDYoJbsk',
    resources: [
      { name: 'Penetration Testing Guide', url: 'https://example.com/pentest.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 50,
    courseId: 10,
    title: 'Cryptography and Data Protection',
    description: 'Cryptographic principles and data protection methods',
    duration: '127 minutes',
    order: 4,
    content: 'Understand encryption, hashing, digital signatures, and data protection techniques.',
    videoUrl: 'https://www.youtube.com/watch?v=C7vmouDOJYM',
    resources: [
      { name: 'Cryptography Guide', url: 'https://example.com/cryptography.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 51,
    courseId: 10,
    title: 'Incident Response and Recovery',
    description: 'Incident response planning and disaster recovery',
    duration: '10 minutes',
    order: 5,
    content: 'Learn incident response procedures, forensics basics, and disaster recovery planning.',
    videoUrl: 'https://www.youtube.com/watch?v=X2UiMLxRdhE',
    resources: [
      { name: 'Incident Response Plan', url: 'https://example.com/incident-response.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 52,
    courseId: 10,
    title: 'Security Compliance and Best Practices',
    description: 'Security frameworks, compliance, and best practices',
    duration: '125 minutes',
    order: 6,
    content: 'Understand security frameworks (ISO 27001, NIST), compliance requirements, and security best practices.',
    videoUrl: 'https://www.youtube.com/watch?v=JswwHeEqBIc',
    resources: [
      { name: 'Compliance Checklist', url: 'https://example.com/compliance.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },

  // Course 11: Cloud Computing with AWS
  {
    id: 53,
    courseId: 11,
    title: 'AWS Fundamentals and Account Setup',
    description: 'Introduction to AWS and account configuration',
    duration: '25 minutes',
    order: 1,
    content: 'Learn AWS basics, account setup, billing, and the AWS Management Console.',
    videoUrl: 'https://www.youtube.com/watch?v=Nzv-tzU-UAw',
    resources: [
      { name: 'AWS Getting Started Guide', url: 'https://example.com/aws-start.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 54,
    courseId: 11,
    title: 'EC2 Instances and Virtual Machines',
    description: 'Launch and manage EC2 virtual machines',
    duration: '7 minutes',
    order: 2,
    content: 'Master EC2 instance types, launch configurations, security groups, and instance management.',
    videoUrl: 'https://www.youtube.com/watch?v=NfnVflt1Jxw',
    resources: [
      { name: 'EC2 Reference Guide', url: 'https://example.com/ec2-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 55,
    courseId: 11,
    title: 'S3 Storage and Data Management',
    description: 'AWS S3 storage service and data management',
    duration: '43 minutes',
    order: 3,
    content: 'Learn S3 buckets, object storage, permissions, versioning, and lifecycle policies.',
    videoUrl: 'https://www.youtube.com/watch?v=9vK7fwAhVtA',
    resources: [
      { name: 'S3 Best Practices', url: 'https://example.com/s3-practices.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 56,
    courseId: 11,
    title: 'Lambda Serverless Functions',
    description: 'AWS Lambda serverless computing service',
    duration: '35 minutes',
    order: 4,
    content: 'Master AWS Lambda functions, triggers, event sources, and serverless architecture patterns.',
    videoUrl: 'https://www.youtube.com/watch?v=5fTtmeCpSRw',
    resources: [
      { name: 'Lambda Function Examples', url: 'https://example.com/lambda-examples.zip' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 57,
    courseId: 11,
    title: 'VPC and Network Configuration',
    description: 'Virtual Private Cloud and network setup',
    duration: '125 minutes',
    order: 5,
    content: 'Learn VPC setup, subnets, route tables, internet gateways, and network security.',
    videoUrl: 'https://www.youtube.com/watch?v=g2JOHLHh4rI',
    resources: [
      { name: 'VPC Configuration Guide', url: 'https://example.com/vpc-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 58,
    courseId: 11,
    title: 'IAM Security and Access Control',
    description: 'Identity and Access Management in AWS',
    duration: '36 minutes',
    order: 6,
    content: 'Master IAM users, roles, policies, and security best practices for AWS access control.',
    videoUrl: 'https://www.youtube.com/watch?v=CH1EhkBzkyo',
    resources: [
      { name: 'IAM Best Practices', url: 'https://example.com/iam-practices.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 59,
    courseId: 11,
    title: 'Application Deployment and Scaling',
    description: 'Deploy and scale applications on AWS',
    duration: '60 minutes',
    order: 7,
    content: 'Learn application deployment strategies, auto-scaling, load balancing, and monitoring in AWS.',
    videoUrl: 'https://www.youtube.com/watch?v=esISkPlnxL0',
    resources: [
      { name: 'Deployment Guide', url: 'https://example.com/aws-deployment.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
  },

  // Course 12: Blockchain Development
  {
    id: 60,
    courseId: 12,
    title: 'Blockchain Fundamentals and Bitcoin',
    description: 'Understanding blockchain technology and Bitcoin',
    duration: '7 minutes',
    order: 1,
    content: 'Learn blockchain basics, distributed ledger technology, consensus mechanisms, and Bitcoin fundamentals.',
    videoUrl: 'https://www.youtube.com/watch?v=YJyXfjbBmc8',
    resources: [
      { name: 'Blockchain Basics Guide', url: 'https://example.com/blockchain-basics.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 61,
    courseId: 12,
    title: 'Ethereum and Smart Contract Basics',
    description: 'Introduction to Ethereum and smart contracts',
    duration: '33 minutes',
    order: 2,
    content: 'Understand Ethereum platform, smart contracts, gas fees, and the Ethereum Virtual Machine.',
    videoUrl: 'https://www.youtube.com/watch?v=04f1YsVntw8',
    resources: [
      { name: 'Ethereum Guide', url: 'https://example.com/ethereum-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 62,
    courseId: 12,
    title: 'Solidity Programming Language',
    description: 'Learn Solidity for smart contract development',
    duration: '75 minutes',
    order: 3,
    content: 'Master Solidity programming language, contract structure, data types, and functions.',
    videoUrl: 'https://www.youtube.com/watch?v=RQzuQb0dfBM',
    resources: [
      { name: 'Solidity Reference', url: 'https://example.com/solidity-ref.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 63,
    courseId: 12,
    title: 'DApp Development with Web3.js',
    description: 'Build decentralized applications using Web3.js',
    duration: '22 minutes',
    order: 4,
    content: 'Learn to build decentralized applications using Web3.js, MetaMask integration, and blockchain interaction.',
    videoUrl: 'https://www.youtube.com/watch?v=t3wM5903ty0',
    resources: [
      { name: 'DApp Development Guide', url: 'https://example.com/dapp-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 64,
    courseId: 12,
    title: 'Token Creation and ICO Concepts',
    description: 'Create tokens and understand ICO mechanisms',
    duration: '120 minutes',
    order: 5,
    content: 'Learn ERC-20 token standards, token creation, ICO concepts, and tokenomics.',
    videoUrl: 'https://www.youtube.com/watch?v=EeE33rLuUuU',
    resources: [
      { name: 'Token Creation Guide', url: 'https://example.com/token-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 65,
    courseId: 12,
    title: 'DeFi Protocols and Integration',
    description: 'Decentralized Finance protocols and integration',
    duration: '18 minutes',
    order: 6,
    content: 'Understand DeFi protocols, liquidity pools, yield farming, and DeFi integration.',
    videoUrl: 'https://www.youtube.com/watch?v=e9Eg0CmboFU',
    resources: [
      { name: 'DeFi Protocol Guide', url: 'https://example.com/defi-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1509909756405-be0199881695?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 66,
    courseId: 12,
    title: 'NFT Development and Marketplace',
    description: 'Create NFTs and build NFT marketplaces',
    duration: '128 minutes',
    order: 7,
    content: 'Learn NFT standards, create NFT collections, and build NFT marketplace applications.',
    videoUrl: 'https://www.youtube.com/watch?v=y6JfVdcJh1k',
    resources: [
      { name: 'NFT Development Guide', url: 'https://example.com/nft-guide.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 67,
    courseId: 12,
    title: 'Blockchain Security and Auditing',
    description: 'Smart contract security and auditing practices',
    duration: '240 minutes',
    order: 8,
    content: 'Learn smart contract security vulnerabilities, auditing practices, and security best practices.',
    videoUrl: 'https://www.youtube.com/watch?v=SyVMma1IkXM',
    resources: [
      { name: 'Security Audit Checklist', url: 'https://example.com/audit-checklist.pdf' }
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80',
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
