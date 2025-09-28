import apiClient from './apiClient';

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

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  // Check if user exists in our mock data, otherwise create a dynamic student user
  let user = Object.values(MOCK_USERS).find(u => u.email === email);
  
  if (!user) {
    // Create a dynamic student user for any valid email
    const username = email.split('@')[0];
    const displayName = username.charAt(0).toUpperCase() + username.slice(1).replace(/[._-]/g, ' ');
    
    user = {
      id: Date.now(),
      email: email.toLowerCase(),
      name: displayName,
      role: 'student' // Default to student role
    };
  }

  // Generate a token
  const token = `mock-token-${user.id}-${Date.now()}`;

  return {
    user,
    token
  };
}

// Register function with real API
export async function register(userData) {
  // Validate required fields
  if (!userData.email || !userData.password || !userData.name || !userData.role) {
    throw new Error('All fields are required');
  }

  try {
    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: userData.role
    });

    const data = response.data;
    
    // Return user and token in the expected format
    return {
      user: data.user,
      token: data.token
    };
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.message || 'Registration failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Registration failed. Please try again.');
    }
  }
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
