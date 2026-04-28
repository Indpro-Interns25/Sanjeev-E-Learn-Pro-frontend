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

function isProtectedUserEndpoint(path, method = 'get') {
  const normalizedMethod = String(method || 'get').toLowerCase();

  // Allow public course browsing on read-only requests.
  if (path.startsWith('/api/courses')) {
    const isReadOnly = normalizedMethod === 'get' || normalizedMethod === 'head' || normalizedMethod === 'options';
    if (isReadOnly) {
      return false;
    }
  }

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

/**
 * Get token from both localStorage and sessionStorage
 * Reads localStorage first (persistent), then falls back to sessionStorage
 * This ensures token persists on mobile after refresh
 */
function getTokenFromAllStorages() {
  try {
    // Check localStorage first (persistent across sessions)
    const localToken = localStorage.getItem('token');
    if (localToken) {
      console.debug('📱 TOKEN: Found in localStorage');
      return localToken;
    }

    // Fall back to sessionStorage (current session)
    const sessionToken = sessionStorage.getItem('token');
    if (sessionToken) {
      console.debug('📱 TOKEN: Found in sessionStorage');
      return sessionToken;
    }

    console.debug('📱 TOKEN: Not found in any storage');
    return null;
  } catch (error) {
    console.error('❌ Error reading token from storage:', error);
    return null;
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

/**
 * REQUEST INTERCEPTOR: Attach token and validate baseURL
 * Ensures every request has proper Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    // Fix localhost URLs
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

    // ═══════════════════════════════════════════════════════════════════════════
    // ADMIN TOKEN HANDLING
    // ═══════════════════════════════════════════════════════════════════════════
    if (isAdminEndpoint && !bypassAdminAuth) {
      const adminToken = getAdminToken();

      if (adminToken && !isDemoToken(adminToken)) {
        config.headers.Authorization = `Bearer ${adminToken}`;
        console.debug('🔐 Admin Token Attached:', {
          method: config.method?.toUpperCase(),
          path: requestPath,
          tokenLength: adminToken.length
        });
        return config;
      }

      console.error('🚨 Missing admin token for protected request:', requestPath);
      clearAdminSession();
      safeRedirect('/admin-login');
      return Promise.reject(new Error('Not authorized, no token'));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // USER TOKEN HANDLING - CRITICAL FIX FOR MOBILE
    // ═══════════════════════════════════════════════════════════════════════════
    // Get token from both localStorage AND sessionStorage for mobile persistence
    const accessToken = getTokenFromAllStorages() || getAccessToken();
    const needsUserAuth = isProtectedUserEndpoint(requestPath, config.method);

    console.debug('🔍 Token Check:', {
      endpoint: requestPath,
      hasToken: !!accessToken,
      tokenExists: !!accessToken,
      isDemoToken: accessToken ? isDemoToken(accessToken) : false,
      needsAuth: needsUserAuth
    });

    if (accessToken && !isDemoToken(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.debug('🔑 User Token Attached:', {
        method: config.method?.toUpperCase(),
        path: requestPath,
        tokenLength: accessToken.length,
        source: 'localStorage/sessionStorage'
      });
      return config;
    }

    if (accessToken && isDemoToken(accessToken)) {
      console.warn('🧪 Demo token detected, skipping Authorization header for this request:', requestPath);
      return config;
    }

    if (needsUserAuth) {
      console.error('🚨 API ERROR:', {
        message: 'Missing token for protected request',
        endpoint: requestPath,
        method: config.method?.toUpperCase(),
        timestamp: new Date().toISOString()
      });
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

/**
 * RESPONSE INTERCEPTOR: Handle 401 errors and clear invalid tokens
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🚨 API ERROR:', {
      status: error?.response?.status,
      endpoint: error?.config?.url,
      message: error?.response?.data?.message || error?.message,
      timestamp: new Date().toISOString()
    });

    if (error?.response?.status === 401) {
      const requestPath = getRequestPath(error.config);
      const isAdminEndpoint = requestPath.includes('/admin/');
      const isAuthEndpoint = isPublicAuthEndpoint(requestPath);
      const hasDemoUserToken = isDemoToken(getAccessToken());
      const hasDemoAdminToken = isDemoToken(getAdminToken());
      const hasRealUserToken = !!getAccessToken() && !hasDemoUserToken;

      console.error('🚨 Unauthorized API response:', {
        method: error.config?.method?.toUpperCase(),
        url: requestPath,
        message: error.response?.data?.message || error.message
      });

      if (!isAuthEndpoint && !hasDemoUserToken && !hasDemoAdminToken) {
        if (isAdminEndpoint) {
          clearAdminSession();
          safeRedirect('/admin-login');
        } else if (hasRealUserToken) {
          clearAuthSession();
          safeRedirect('/login');
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
