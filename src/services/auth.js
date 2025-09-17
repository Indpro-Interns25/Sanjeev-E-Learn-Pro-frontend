// Mock delay to simulate API calls
const MOCK_DELAY = 800;

// Mock users for testing
const MOCK_USERS = {
  student: {
    id: 1,
    email: 'student@example.com',
    name: 'John Student',
    role: 'student'
  },
  instructor: {
    id: 2,
    email: 'instructor@example.com',
    name: 'Jane Instructor',
    role: 'instructor'
  }
};

// Mock tokens (in a real app, these would be JWTs)
const MOCK_TOKENS = {
  'student@example.com': 'mock-student-token',
  'instructor@example.com': 'mock-instructor-token'
};

// Helper to simulate API delay
const mockDelay = () => new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

// Mock login function
export async function login(email, password) {
  await mockDelay();
  
  // Simplified validation for demo
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Check if user exists
  const user = Object.values(MOCK_USERS).find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // In a real app, we would verify the password here
  return {
    user,
    token: MOCK_TOKENS[email]
  };
}

// Mock register function
export async function register(userData) {
  await mockDelay();

  // Validate required fields
  if (!userData.email || !userData.password || !userData.name || !userData.role) {
    throw new Error('All fields are required');
  }

  // Check if email is already taken
  if (Object.values(MOCK_USERS).some(u => u.email === userData.email)) {
    throw new Error('Email already registered');
  }

  // Create new mock user
  const newUser = {
    id: Date.now(),
    email: userData.email,
    name: userData.name,
    role: userData.role
  };

  // In a real app, we would save the user to a database here
  return {
    user: newUser,
    token: `mock-token-${newUser.id}`
  };
}

// Mock token validation
export async function validateToken(token) {
  await mockDelay();

  // Find user by token
  const email = Object.keys(MOCK_TOKENS).find(key => MOCK_TOKENS[key] === token);
  if (!email) {
    throw new Error('Invalid token');
  }

  return Object.values(MOCK_USERS).find(u => u.email === email);
}

// Mock password reset request
export async function requestPasswordReset(email) {
  await mockDelay();
  
  const user = Object.values(MOCK_USERS).find(u => u.email === email);
  if (!user) {
    throw new Error('User not found');
  }

  // In a real app, we would send a password reset email here
  return { message: 'Password reset email sent' };
}

// Export mock users for testing
export const mockUsers = MOCK_USERS;
