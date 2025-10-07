const STORAGE_KEY = 'mockComments_v1';

// Default seed data
const initialComments = [
  // Course 1: Introduction to Web Development
  {
    id: 1,
    courseId: 1,
    lessonId: null, // Course-level comment
    userId: 101,
    userName: 'Alice Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Excellent course for beginners! The HTML and CSS sections are particularly well explained.',
    rating: 5,
    timestamp: new Date('2024-09-20T10:30:00Z'),
    likes: 23,
    replies: [
      {
        id: 101,
        userId: 102,
        userName: 'Bob Smith',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'I agree! The JavaScript section helped me a lot too.',
        timestamp: new Date('2024-09-20T14:15:00Z'),
        likes: 5
      }
    ]
  },
  {
    id: 2,
    courseId: 1,
    lessonId: 2,
    userId: 103,
    userName: 'Charlie Davis',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'The CSS styling lesson was amazing! Really helped me understand flexbox and grid.',
    rating: 4,
    timestamp: new Date('2024-09-21T09:45:00Z'),
    likes: 15,
    replies: []
  },
  {
    id: 3,
    courseId: 1,
    lessonId: null,
    userId: 104,
    userName: 'Diana Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Great course structure and pacing. Perfect for someone new to web development.',
    rating: 5,
    timestamp: new Date('2024-09-22T16:20:00Z'),
    likes: 18,
    replies: [
      {
        id: 102,
        userId: 105,
        userName: 'Eva Brown',
        userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'Totally agree! Jane is an excellent instructor.',
        timestamp: new Date('2024-09-22T18:30:00Z'),
        likes: 8
      }
    ]
  },

  // Course 2: Advanced React Programming
  {
    id: 4,
    courseId: 2,
    lessonId: null,
    userId: 106,
    userName: 'Frank Miller',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Advanced React concepts explained brilliantly! The hooks section is particularly comprehensive.',
    rating: 5,
    timestamp: new Date('2024-09-18T11:00:00Z'),
    likes: 32,
    replies: [
      {
        id: 103,
        userId: 107,
        userName: 'Grace Lee',
        userAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The Context API explanation was spot on!',
        timestamp: new Date('2024-09-18T13:45:00Z'),
        likes: 12
      }
    ]
  },
  {
    id: 5,
    courseId: 2,
    lessonId: 8,
    userId: 108,
    userName: 'Henry Garcia',
    userAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Performance optimization techniques are gold! My app is now 40% faster.',
    rating: 5,
    timestamp: new Date('2024-09-19T15:30:00Z'),
    likes: 28,
    replies: []
  },

  // Course 3: Python for Data Science
  {
    id: 6,
    courseId: 3,
    lessonId: null,
    userId: 109,
    userName: 'Ivy Chen',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Perfect introduction to data science! The pandas section is incredibly detailed.',
    rating: 5,
    timestamp: new Date('2024-09-17T10:15:00Z'),
    likes: 41,
    replies: [
      {
        id: 104,
        userId: 110,
        userName: 'Jack Thompson',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The visualization examples are fantastic!',
        timestamp: new Date('2024-09-17T14:20:00Z'),
        likes: 9
      }
    ]
  },
  {
    id: 7,
    courseId: 3,
    lessonId: 12,
    userId: 111,
    userName: 'Kate Rodriguez',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Data manipulation with pandas is now my superpower thanks to this lesson!',
    rating: 5,
    timestamp: new Date('2024-09-19T12:00:00Z'),
    likes: 22,
    replies: []
  },

  // Course 4: Machine Learning Fundamentals
  {
    id: 8,
    courseId: 4,
    lessonId: null,
    userId: 112,
    userName: 'Liam Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Complex ML concepts made simple. Dr. Alex Smith is an amazing teacher!',
    rating: 5,
    timestamp: new Date('2024-09-16T09:30:00Z'),
    likes: 35,
    replies: [
      {
        id: 105,
        userId: 113,
        userName: 'Mia Taylor',
        userAvatar: 'https://images.unsplash.com/photo-1502767089025-6572583495d8?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The regression algorithms explanation was crystal clear!',
        timestamp: new Date('2024-09-16T16:45:00Z'),
        likes: 14
      }
    ]
  },

  // Course 5: Node.js Backend Development
  {
    id: 9,
    courseId: 5,
    lessonId: null,
    userId: 114,
    userName: 'Noah Williams',
    userAvatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Solid backend development course. The Express.js section is particularly thorough.',
    rating: 4,
    timestamp: new Date('2024-09-15T13:20:00Z'),
    likes: 26,
    replies: []
  },
  {
    id: 10,
    courseId: 5,
    lessonId: 24,
    userId: 115,
    userName: 'Olivia Davis',
    userAvatar: 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'RESTful API development made easy! Great practical examples.',
    rating: 5,
    timestamp: new Date('2024-09-20T11:30:00Z'),
    likes: 19,
    replies: []
  },

  // Course 6: Mobile App Development with React Native
  {
    id: 11,
    courseId: 6,
    lessonId: null,
    userId: 116,
    userName: 'Paul Johnson',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Excellent React Native course! Sarah explains complex mobile concepts very clearly.',
    rating: 5,
    timestamp: new Date('2024-09-14T14:50:00Z'),
    likes: 38,
    replies: [
      {
        id: 106,
        userId: 117,
        userName: 'Quinn Martinez',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The navigation setup was exactly what I needed!',
        timestamp: new Date('2024-09-14T17:20:00Z'),
        likes: 11
      }
    ]
  },

  // Course 7: Digital Marketing Masterclass
  {
    id: 12,
    courseId: 7,
    lessonId: null,
    userId: 118,
    userName: 'Rachel Green',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Comprehensive marketing course! The SEO strategies are already boosting my website traffic.',
    rating: 5,
    timestamp: new Date('2024-09-13T10:00:00Z'),
    likes: 42,
    replies: []
  },
  {
    id: 13,
    courseId: 7,
    lessonId: 34,
    userId: 119,
    userName: 'Sam Wilson',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Social media marketing strategies are spot on! Increased my engagement by 200%.',
    rating: 5,
    timestamp: new Date('2024-09-18T16:15:00Z'),
    likes: 31,
    replies: []
  },

  // Course 8: UI/UX Design Principles
  {
    id: 14,
    courseId: 8,
    lessonId: null,
    userId: 120,
    userName: 'Tina Brown',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Amazing design course! David Lee really knows how to teach design thinking.',
    rating: 5,
    timestamp: new Date('2024-09-12T12:30:00Z'),
    likes: 29,
    replies: [
      {
        id: 107,
        userId: 121,
        userName: 'Uma Patel',
        userAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The Figma tutorials are incredibly helpful!',
        timestamp: new Date('2024-09-12T15:45:00Z'),
        likes: 13
      }
    ]
  },

  // Course 9: Advanced JavaScript ES6+
  {
    id: 15,
    courseId: 9,
    lessonId: null,
    userId: 122,
    userName: 'Victor Lee',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Modern JavaScript made accessible! The async/await section is brilliant.',
    rating: 5,
    timestamp: new Date('2024-09-11T08:45:00Z'),
    likes: 33,
    replies: []
  },

  // Course 10: Cybersecurity Fundamentals
  {
    id: 16,
    courseId: 10,
    lessonId: null,
    userId: 123,
    userName: 'Wendy Clark',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Essential cybersecurity knowledge! Robert Chen explains threats and solutions perfectly.',
    rating: 5,
    timestamp: new Date('2024-09-10T14:20:00Z'),
    likes: 27,
    replies: []
  },

  // Course 11: Cloud Computing with AWS
  {
    id: 17,
    courseId: 11,
    lessonId: null,
    userId: 124,
    userName: 'Xavier Torres',
    userAvatar: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Comprehensive AWS course! Lisa Wang makes cloud computing concepts easy to understand.',
    rating: 5,
    timestamp: new Date('2024-09-09T11:10:00Z'),
    likes: 36,
    replies: [
      {
        id: 108,
        userId: 125,
        userName: 'Yara Singh',
        userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
        comment: 'The EC2 and S3 sections were exactly what I needed for my project!',
        timestamp: new Date('2024-09-09T16:30:00Z'),
        likes: 15
      }
    ]
  },

  // Course 12: Blockchain Development
  {
    id: 18,
    courseId: 12,
    lessonId: null,
    userId: 126,
    userName: 'Zoe Adams',
    userAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Cutting-edge blockchain development course! Tom Rodriguez explains DApps development brilliantly.',
    rating: 4,
    timestamp: new Date('2024-09-08T13:40:00Z'),
    likes: 24,
    replies: []
  },
  {
    id: 19,
    courseId: 12,
    lessonId: 63,
    userId: 127,
    userName: 'Alex Kumar',
    userAvatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=150&h=150&q=80',
    comment: 'Solidity programming section is incredibly detailed. Built my first smart contract!',
    rating: 5,
    timestamp: new Date('2024-09-15T09:25:00Z'),
    likes: 21,
    replies: []
  }
];

// Load comments from localStorage when available, otherwise use seed data
let mockComments = [];
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // revive Date objects if necessary
      parsed.forEach(c => {
        if (c.timestamp) c.timestamp = new Date(c.timestamp);
        if (c.replies && Array.isArray(c.replies)) {
          c.replies.forEach(r => { if (r.timestamp) r.timestamp = new Date(r.timestamp); });
        }
      });
      mockComments = parsed;
      return;
    }
  } catch (e) {
    // ignore parse errors and fall back to initial data
    console.warn('Failed to load comments from localStorage, using seed data', e);
  }

  mockComments = initialComments.map(c => ({
    ...c,
    // ensure timestamp serializable to Date
    timestamp: c.timestamp instanceof Date ? c.timestamp : new Date(c.timestamp),
    replies: (c.replies || []).map(r => ({ ...r, timestamp: r.timestamp instanceof Date ? r.timestamp : new Date(r.timestamp) }))
  }));
  saveToStorage();
}

function saveToStorage() {
  try {
    const copy = mockComments.map(c => ({
      ...c,
      // Dates to ISO strings for storage
      timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp,
      replies: (c.replies || []).map(r => ({ ...r, timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp }))
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
  } catch (e) {
    console.warn('Failed to save comments to localStorage', e);
  }
}

// Initialize storage-backed comments
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  loadFromStorage();
} else {
  mockComments = initialComments;
}

// Helper functions
export function getCommentsByCourse(courseId) {
  return mockComments.filter(comment => comment.courseId === courseId).map(c => ({ ...c }));
}

export function getCourseComments(courseId) {
  return mockComments.filter(comment => comment.courseId === courseId && comment.lessonId === null).map(c => ({ ...c }));
}

export function getLessonComments(courseId, lessonId) {
  return mockComments.filter(comment => comment.courseId === courseId && comment.lessonId === lessonId).map(c => ({ ...c }));
}

export function addComment(comment) {
  const newComment = {
    id: Date.now(),
    ...comment,
    timestamp: new Date(),
    likes: 0,
    replies: []
  };
  mockComments.push(newComment);
  try { saveToStorage(); } catch { /* ignore */ }
  return newComment;
}

export function addReply(commentId, reply) {
  const comment = mockComments.find(c => c.id === commentId);
  if (comment) {
    const newReply = {
      id: Date.now(),
      ...reply,
      timestamp: new Date(),
      likes: 0
    };
    comment.replies.push(newReply);
  try { saveToStorage(); } catch { /* ignore */ }
    return newReply;
  }
  return null;
}

export function likeComment(commentId) {
  const comment = mockComments.find(c => c.id === commentId);
  if (comment) {
    comment.likes += 1;
  try { saveToStorage(); } catch { /* ignore */ }
    return comment.likes;
  }
  return 0;
}