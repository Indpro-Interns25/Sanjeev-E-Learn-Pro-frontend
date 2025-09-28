import apiClient from './apiClient';

// Login function with real API
export async function login(email, password) {
  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }

  try {
    const response = await apiClient.post('/auth/login', {
      email: email.toLowerCase(),
      password
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
      const errorMessage = error.response.data?.message || 'Login failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Login failed. Please try again.');
    }
  }
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

// Token validation with real API
export async function validateToken(token) {
  try {
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.user;
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('Invalid or expired token');
      }
      const errorMessage = error.response.data?.message || 'Token validation failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Token validation failed. Please try again.');
    }
  }
}

// Password reset request with real API
export async function requestPasswordReset(email) {
  try {
    const response = await apiClient.post('/auth/forgot-password', {
      email
    });

    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Password reset request failed';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Unable to connect to server. Please try again.');
    } else {
      // Something else happened
      throw new Error('Password reset request failed. Please try again.');
    }
  }
}
