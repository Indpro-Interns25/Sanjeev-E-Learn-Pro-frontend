import apiClient from './apiClient';

/**
 * Real Authentication API Service
 * This service makes actual HTTP requests to the backend API
 * which will store data in the PostgreSQL database
 * 
 * Note: If backend is not running, API calls will fail with network errors
 */

// Register a new user
export async function register(userData) {
  try {
    const response = await apiClient.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role
    });

    return response.data;
  } catch (error) {
    // Handle different error response formats
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Registration failed';
    throw new Error(message);
  }
}

// Login user
export async function login(email, password) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   error.message || 
                   'Login failed';
    throw new Error(message);
  }
}

// Validate token
export async function validateToken(token) {
  try {
    const response = await apiClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data.user;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      // If backend is not running, remove invalid token and continue
      localStorage.removeItem('token');
      throw new Error('Backend API server is not running');
    }
    
    const message = error.response?.data?.message || 'Invalid token';
    throw new Error(message);
  }
}

// Request password reset
export async function requestPasswordReset(email) {
  try {
    const response = await apiClient.post('/auth/forgot-password', {
      email
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      throw new Error('Backend API server is not running. Please start the backend server on port 3002.');
    }
    
    const message = error.response?.data?.message || 
                   error.message || 
                   'Password reset request failed';
    throw new Error(message);
  }
}

// Logout user
export async function logout() {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Logout errors are usually not critical, just log them
    if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
      console.warn('Logout request failed:', error.message);
    }
  }
}
