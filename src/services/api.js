import axios from 'axios';
import { API_URL } from '../config/config';
import { getAccessToken, getAdminToken, clearAuthSession, clearAdminSession } from '../utils/tokenStorage';

const LOCALHOST_ORIGIN_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'];
const PROTECTED_USER_PATHS = [
  '/api/courses',
  '/api/enrollments',
  '/api/user',
  '/api/video-progress',
  '/api/notes',
  '/api/bookmarks',
  '/api/comments',
  '/api/quizzes',
  '/api/lessons',
  '/api/lectures',
  '/api/progress',
  '/api/reports'
];

function rewriteLocalhostAbsoluteUrlToApiPath(url) {
  if (typeof url !== 'string') return url;

  const trimmed = url.trim();
  if (!LOCALHOST_ORIGIN_REGEX.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed;
  }
}

function getRequestPath(config) {
  if (typeof config?.url !== 'string') return '';
  return config.url.trim();
}

function isPublicAuthEndpoint(path) {
  return PUBLIC_AUTH_PATHS.some((endpoint) => path.includes(endpoint));
}

function isProtectedUserEndpoint(path) {
  return PROTECTED_USER_PATHS.some((endpoint) => path.startsWith(endpoint));
}

function safeRedirect(path) {
  if (typeof window === 'undefined') return;

  if (window.location.pathname !== path) {
    window.location.href = path;
  }
}

function isDemoToken(token) {
  return typeof token === 'string' && (token.startsWith('demo-token-') || token.startsWith('demo-admin-'));
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof config.baseURL === 'string' && LOCALHOST_ORIGIN_REGEX.test(config.baseURL)) {
      console.warn('⚠️ Rewriting localhost baseURL to API_URL:', config.baseURL);
      config.baseURL = API_URL;
    }

    if (config.url && config.url !== config.url.trim()) {
      console.warn('⚠️ Trimming whitespace from request URL:', config.url);
      config.url = config.url.trim();
    }

    if (typeof config.url === 'string' && LOCALHOST_ORIGIN_REGEX.test(config.url.trim())) {
      console.warn('⚠️ Rewriting localhost request URL to API_URL:', config.url);
      config.url = rewriteLocalhostAbsoluteUrlToApiPath(config.url);
      config.baseURL = API_URL;
    }

    config.headers = config.headers || {};

    const requestPath = getRequestPath(config);
    const isAdminEndpoint = requestPath.includes('/admin/');
    const bypassAdminAuth = typeof window !== 'undefined' && localStorage.getItem('bypassAdminAuth') === 'true';

    if (isAdminEndpoint && !bypassAdminAuth) {
      const adminToken = getAdminToken();

      if (adminToken && !isDemoToken(adminToken)) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.debug('🔐 Attached admin token:', config.method?.toUpperCase(), requestPath);
        return config;
      }

      console.error('🚨 Missing admin token for protected request:', requestPath);
      clearAdminSession();
      safeRedirect('/admin-login');
      return Promise.reject(new Error('Not authorized, no token'));
    }

    const accessToken = getAccessToken();
    const needsUserAuth = isProtectedUserEndpoint(requestPath);

    if (accessToken && !isDemoToken(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.debug('🔑 Attached token:', config.method?.toUpperCase(), requestPath);
      return config;
    }

    if (accessToken && isDemoToken(accessToken)) {
      console.warn('🧪 Demo token detected, skipping Authorization header for this request:', requestPath);
      return config;
    }

    if (needsUserAuth) {
      console.error('🚨 Missing token for protected request:', requestPath);
      clearAuthSession();
      safeRedirect('/login');
      return Promise.reject(new Error('Not authorized, no token'));
    }

    if (isPublicAuthEndpoint(requestPath) && config.headers.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestPath = getRequestPath(error.config);
      const isAdminEndpoint = requestPath.includes('/admin/');
      const isAuthEndpoint = isPublicAuthEndpoint(requestPath);
      const hasDemoUserToken = isDemoToken(getAccessToken());
      const hasDemoAdminToken = isDemoToken(getAdminToken());

      console.error('🚨 Unauthorized API response:', {
        method: error.config?.method?.toUpperCase(),
        url: requestPath,
        message: error.response?.data?.message || error.message
      });

      if (!isAuthEndpoint && !hasDemoUserToken && !hasDemoAdminToken) {
        if (isAdminEndpoint) {
          clearAdminSession();
          safeRedirect('/admin-login');
        } else {
          clearAuthSession();
          safeRedirect('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
