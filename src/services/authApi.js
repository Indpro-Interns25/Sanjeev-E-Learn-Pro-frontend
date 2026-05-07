import apiClient from './apiClient';
import { getApiErrorMessage } from './apiError';

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
    throw new Error(getApiErrorMessage(error, 'Registration failed'));
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
    throw new Error(getApiErrorMessage(error, 'Login failed'));
  }
}

// Validate token
export async function validateToken(token) {
  try {
    const requestConfig = {};

    if (token) {
      requestConfig.headers = {
        Authorization: `Bearer ${token}`
      };
    }

    const response = await apiClient.get('/auth/me', requestConfig);

    return response.data.user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Invalid token'));
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
    throw new Error(getApiErrorMessage(error, 'Password reset request failed'));
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
