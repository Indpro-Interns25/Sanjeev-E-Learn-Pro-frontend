import axios from 'axios';
import { getAccessToken, getAdminToken, clearAuthSession, clearAdminSession } from '../utils/tokenStorage';
import { API_URL } from '../config/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Validate URL for trailing spaces
    if (config.url && config.url !== config.url.trim()) {
      console.error('🚨 URL has trailing spaces!', {
        original: config.url,
        trimmed: config.url.trim(),
        originalLength: config.url.length,
        trimmedLength: config.url.trim().length
      });
      // Fix the URL by trimming it
      config.url = config.url.trim();
    }
    
    // Check if this is an admin endpoint
    const isAdminEndpoint = config.url?.includes('/admin/');

    // Development-only bypass: if localStorage.bypassAdminAuth === 'true', do not attach admin token
    // This is useful for quickly checking whether endpoints exist or are mounted without auth blocking.
    const bypassAdminAuth = typeof window !== 'undefined' && localStorage.getItem('bypassAdminAuth') === 'true';

    // Use appropriate token based on endpoint unless bypass is enabled
    let token;
    if (isAdminEndpoint && !bypassAdminAuth) {
      token = getAdminToken();
    } else if (!isAdminEndpoint) {
      token = getAccessToken();
    }

    const isDemoToken = typeof token === 'string' && (token.startsWith('demo-token-') || token.startsWith('demo-admin-'));

    // Never attach demo tokens to backend requests; they are local-only fallback sessions.
    if (token && !isDemoToken) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (isAdminEndpoint && bypassAdminAuth) {
      // Informative log only in development
      console.warn('🛠️ Bypassing admin Authorization header for this request (development only).');
    }

    // Debug logging for admin endpoints
    if (isAdminEndpoint) {
      console.warn('🔐 Admin API call:', config.method?.toUpperCase(), config.url);
      if (bypassAdminAuth) console.warn('🎫 Admin auth bypass active');
      else console.warn('🎫 Using admin token:', token ? 'Present' : 'Missing');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAdminEndpoint = requestUrl.includes('/admin/');
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/forgot-password');
      const isPublicCatalogEndpoint = requestUrl.includes('/api/courses') || requestUrl.includes('/api/categories');

      const userToken = getAccessToken();
      const adminToken = getAdminToken();
      const hasDemoUserToken = typeof userToken === 'string' && userToken.startsWith('demo-token-');
      const hasDemoAdminToken = typeof adminToken === 'string' && adminToken.startsWith('demo-admin-');

      // Do not hard-redirect for auth/public endpoints or local demo sessions.
      if (isAuthEndpoint || isPublicCatalogEndpoint || hasDemoUserToken || hasDemoAdminToken) {
        return Promise.reject(error);
      }
      
      const onAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

      if (isAdminEndpoint && onAdminRoute) {
        clearAdminSession();
        window.location.href = '/admin-login';
      } else if (!isAdminEndpoint) {
        clearAuthSession();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
