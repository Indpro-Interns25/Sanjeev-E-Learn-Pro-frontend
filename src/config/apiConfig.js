/**
 * API Configuration Utility
 * Centralized configuration for API base URL and environment settings
 * 
 * This file provides a single source of truth for API configuration across the app.
 * The VITE_API_URL environment variable is set in production on Vercel.
 */

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sanjeev-e-learn-pro-backend-1.onrender.com';

// Socket URL for real-time connections
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

// Check if running in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Log configuration in development mode
 */
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    API_BASE_URL,
    SOCKET_URL,
    environment: import.meta.env.MODE
  });
}

export { API_BASE_URL, SOCKET_URL, isDevelopment };
