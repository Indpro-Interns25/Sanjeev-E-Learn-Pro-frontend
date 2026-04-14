export const mockCourses = [
  {
    id: 1,
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    instructor: {
      id: 2,
      name: 'Jane Instructor'
    },
    instructor_name: 'Jane Instructor',
    category: 'Web Development',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
    price: 399,
    duration: '6 weeks',
    enrolled: 0,
    rating: 4.5,
    lessons: [1, 2, 3, 4, 5],
    previewVideo: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
    playlistId: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf',
    curriculum: [
      'HTML Fundamentals and Document Structure',
      'CSS Styling and Layout Techniques',
      'JavaScript Programming Basics',
      'Responsive Web Design',
      'Building Your First Website Project'
    ]
  },
  {
    id: 2,
    title: 'Advanced React Programming',
    description: 'Master React hooks, context, and advanced patterns for building modern web applications.',
    instructor: {
      id: 2,
      name: 'Jane Instructor'
    },
    instructor_name: 'Jane Instructor',
    category: 'JavaScript',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    price: 599,
    duration: '8 weeks',
    enrolled: 0,
    rating: 4.8,
    lessons: [6, 7, 8, 9],
    previewVideo: 'https://www.youtube.com/watch?v=HnXPKtro4SM',
    playlistId: 'PLrAXtmErZgOeR5Q8zW8Lc5KOVVsY6k9p9',
    curriculum: [
      'React Hooks and Functional Components',
      'Context API and State Management',
      'Performance Optimization Techniques',
      'Testing React Applications'
    ]
  },
  {
    id: 3,
    title: 'Python for Data Science',
    description: 'Introduction to data analysis and visualization using Python, NumPy, and Pandas.',
    instructor: {
      id: 2,
      name: 'Jane Instructor'
    },
    instructor_name: 'Jane Instructor',
    category: 'Data Science',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
    price: 549,
    duration: '10 weeks',
    enrolled: 0,
    rating: 4.6,
    lessons: [10, 11, 12, 13, 14],
    previewVideo: 'https://www.youtube.com/watch?v=HrRA67O-QXI',
    playlistId: 'PLrAXtmErZgOeW1lqX8x9f8x9y0z1a2b3c4d',
    curriculum: [
      'Python Basics for Data Science',
      'NumPy Arrays and Mathematical Operations',
      'Pandas DataFrames and Data Manipulation',
      'Data Visualization with Matplotlib',
      'Real-world Data Analysis Projects'
    ]
  },
  {
    id: 4,
    title: 'Machine Learning Fundamentals',
    description: 'Learn the basics of machine learning algorithms, supervised and unsupervised learning with Python.',
    instructor: {
      id: 3,
      name: 'Dr. Alex Smith'
    },
    instructor_name: 'Dr. Alex Smith',
    category: 'Data Science',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    price: 0,
    duration: '12 weeks',
    enrolled: 0,
    rating: 4.7,
    lessons: [15, 16, 17, 18, 19, 20],
    previewVideo: 'https://www.youtube.com/watch?v=h0e2HAPTGF4',
    playlistId: 'PLrAXtmErZgOe5e6f7g8h9i0j1k2l3m4n5o',
    curriculum: [
      'Introduction to Machine Learning',
      'Data Preprocessing and Feature Engineering',
      'Linear and Logistic Regression',
      'Decision Trees and Random Forests',
      'Clustering Algorithms',
      'Model Evaluation and Validation'
    ]
  },
  {
    id: 5,
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
    instructor: {
      id: 4,
      name: 'Mike Johnson'
    },
    instructor_name: 'Mike Johnson',
    category: 'Web Development',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
    price: 0,
    duration: '8 weeks',
    enrolled: 0,
    rating: 4.4,
    lessons: [21, 22, 23, 24, 25],
    previewVideo: 'https://www.youtube.com/watch?v=nSFe1-kpfbQ',
    playlistId: 'PLrAXtmErZgOe9q0r1s2t3u4v5w6x7y8z9',
    curriculum: [
      'Node.js Fundamentals and NPM',
      'Express.js Framework and Routing',
      'MongoDB and Mongoose ODM',
      'RESTful API Development',
      'Authentication and Authorization'
    ]
  },
  {
    id: 6,
    title: 'Mobile App Development with React Native',
    description: 'Create cross-platform mobile applications using React Native and Expo.',
    instructor: {
      id: 5,
      name: 'Sarah Wilson'
    },
    instructor_name: 'Sarah Wilson',
    category: 'Mobile Development',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80',
    price: 0,
    duration: '10 weeks',
    enrolled: 0,
    rating: 4.6,
    lessons: [26, 27, 28, 29, 30, 31],
    previewVideo: 'https://www.youtube.com/watch?v=r0oBuQsYta0',
    playlistId: 'PLrAXtmErZgOea1b2c3d4e5f6g7h8i9j0k',
    curriculum: [
      'React Native Setup and Environment',
      'Navigation and Screen Management',
      'Components and Styling',
      'State Management with Redux',
      'Native Device Features',
      'App Store Deployment'
    ]
  },
  {
    id: 7,
    title: 'Digital Marketing Masterclass',
    description: 'Complete guide to digital marketing including SEO, social media, and paid advertising.',
    instructor: {
      id: 6,
      name: 'Emma Davis'
    },
    instructor_name: 'Emma Davis',
    category: 'Marketing',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    price: 429,
    duration: '7 weeks',
    enrolled: 0,
    rating: 4.5,
    lessons: [32, 33, 34, 35, 36],
    previewVideo: 'https://www.youtube.com/watch?v=dS0PtshQDls',
    playlistId: 'PLrAXtmErZgOel1m2n3o4p5q6r7s8t9u0',
    curriculum: [
      'Digital Marketing Fundamentals',
      'Search Engine Optimization (SEO)',
      'Social Media Marketing Strategies',
      'Pay-Per-Click (PPC) Advertising',
      'Analytics and Performance Tracking'
    ]
  },
  {
    id: 8,
    title: 'UI/UX Design Principles',
    description: 'Learn user interface and user experience design fundamentals using Figma and Adobe XD.',
    instructor: {
      id: 7,
      name: 'David Lee'
    },
    instructor_name: 'David Lee',
    category: 'Design',
    level: 'Beginner',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80',
    price: 459,
    duration: '6 weeks',
    enrolled: 0,
    rating: 4.8,
    lessons: [37, 38, 39, 40, 41],
    previewVideo: 'https://www.youtube.com/watch?v=bAARmsv1tms',
    playlistId: 'PLrAXtmErZgOev1w2x3y4z5a6b7c8d9e0f',
    curriculum: [
      'Design Thinking and User Research',
      'Wireframing and Prototyping',
      'Visual Design Principles',
      'Figma and Adobe XD Mastery',
      'Usability Testing and Iteration'
    ]
  },
  {
    id: 9,
    title: 'Advanced JavaScript ES6+',
    description: 'Master modern JavaScript features including async/await, modules, and advanced array methods.',
    instructor: {
      id: 2,
      name: 'Jane Instructor'
    },
    instructor_name: 'Jane Instructor',
    category: 'JavaScript',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=600&q=80',
    price: 549,
    duration: '7 weeks',
    enrolled: 0,
    rating: 4.7,
    lessons: [42, 43, 44, 45, 46],
    previewVideo: 'https://www.youtube.com/watch?v=NCwa_xi0Uuc',
    playlistId: 'PLrAXtmErZgOeg1h2i3j4k5l6m7n8o9p0',
    curriculum: [
      'ES6+ Syntax and Features',
      'Promises and Async/Await',
      'Modules and Module Bundlers',
      'Advanced Array and Object Methods',
      'Functional Programming Concepts'
    ]
  },
  {
    id: 10,
    title: 'Cybersecurity Fundamentals',
    description: 'Introduction to cybersecurity principles, ethical hacking, and network security.',
    instructor: {
      id: 8,
      name: 'Robert Chen'
    },
    instructor_name: 'Robert Chen',
    category: 'Security',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    price: 649,
    duration: '9 weeks',
    enrolled: 0,
    rating: 4.6,
    lessons: [47, 48, 49, 50, 51, 52],
    previewVideo: 'https://www.youtube.com/watch?v=34BtwcL7Mkg',
    playlistId: 'PLrAXtmErZgOes1q2r3s4t5u6v7w8x9y0z',
    curriculum: [
      'Cybersecurity Fundamentals and Threats',
      'Network Security and Firewalls',
      'Ethical Hacking and Penetration Testing',
      'Cryptography and Data Protection',
      'Incident Response and Recovery',
      'Security Compliance and Best Practices'
    ]
  },
  {
    id: 11,
    title: 'Cloud Computing with AWS',
    description: 'Learn Amazon Web Services fundamentals including EC2, S3, Lambda, and deployment strategies.',
    instructor: {
      id: 9,
      name: 'Lisa Wang'
    },
    category: 'Cloud Computing',
    level: 'Intermediate',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    price: 799,
    duration: '11 weeks',
    playlistId: 'PLrAXtmErZgOey1a2b3c4d5e6f7g8h9i0j',
    enrolled: 0,
    rating: 4.5,
    lessons: [53, 54, 55, 56, 57, 58, 59],
    previewVideo: 'https://www.youtube.com/watch?v=Nzv-tzU-UAw',
    curriculum: [
      'AWS Fundamentals and Account Setup',
      'EC2 Instances and Virtual Machines',
      'S3 Storage and Data Management',
      'Lambda Serverless Functions',
      'VPC and Network Configuration',
      'IAM Security and Access Control',
      'Application Deployment and Scaling'
    ]
  },
  {
    id: 12,
    title: 'Blockchain Development',
    description: 'Build decentralized applications with Ethereum, Solidity, and Web3.js.',
    instructor: {
      id: 10,
      name: 'Tom Rodriguez'
    },
    category: 'Blockchain',
    level: 'Advanced',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
    price: 999,
    duration: '14 weeks',
    enrolled: 0,
    rating: 4.4,
    lessons: [60, 61, 62, 63, 64, 65, 66, 67],
    previewVideo: 'https://www.youtube.com/watch?v=YJyXfjbBmc8',
    curriculum: [
      'Blockchain Fundamentals and Bitcoin',
      'Ethereum and Smart Contract Basics',
      'Solidity Programming Language',
      'DApp Development with Web3.js',
      'Token Creation and ICO Concepts',
      'DeFi Protocols and Integration',
      'NFT Development and Marketplace',
      'Blockchain Security and Auditing'
    ]
  }
];

// Helper function to get a course by ID
export function getCourseById(id) {
  return mockCourses.find(course => course.id === id);
}

// Helper function to get courses by instructor ID
export function getCoursesByInstructor(instructorId) {
  return mockCourses.filter(course => course.instructor.id === instructorId);
}

// Helper function to search courses
export function searchCourses(query, category = null) {
  let filtered = mockCourses;
  
  if (category) {
    filtered = filtered.filter(course => course.category === category);
  }
  
  if (query) {
    const searchQuery = query.toLowerCase();
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(searchQuery) ||
      course.description.toLowerCase().includes(searchQuery)
    );
  }
  
  return filtered;
}
