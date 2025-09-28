import axios from 'axios';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: 'http://localhost:3002',  // MUST be 3002, not 3000
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
    
    // Use appropriate token based on endpoint
    const token = isAdminEndpoint 
      ? localStorage.getItem('adminToken')
      : localStorage.getItem('token');
      
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for admin endpoints
    if (isAdminEndpoint) {
      console.warn('🔐 Admin API call:', config.method?.toUpperCase(), config.url);
      console.warn('🎫 Using admin token:', token ? 'Present' : 'Missing');
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
      const isAdminEndpoint = error.config?.url?.includes('/admin/');
      
      if (isAdminEndpoint) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        window.location.href = '/admin-login';
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
