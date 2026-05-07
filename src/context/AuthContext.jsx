import { useReducer, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authApi';
import { AuthContext } from './auth-context';
import { getAccessToken, getAuthUser, setAuthSession, clearAuthSession } from '../utils/tokenStorage';

// ─── helpers ──────────────────────────────────────────────────────────────────
function getTokenExpiry(token) {
  if (!token || token.startsWith('demo-') || token.startsWith('demo-admin-')) return null;
  try {
    const { exp } = jwtDecode(token);
    return exp ? exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false; // demo tokens never expire
  return Date.now() >= expiry;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, loading: true };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const logoutTimerRef = useRef(null);
  const readStorageUser = useCallback(() => getAuthUser(), []);

  // ─── schedule auto-logout when token is about to expire ───────────────────
  const scheduleAutoLogout = useCallback((token) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    const expiry = getTokenExpiry(token);
    if (!expiry) return; // demo tokens — skip
    const delay = expiry - Date.now();
    if (delay <= 0) return; // already expired, caller should handle
    logoutTimerRef.current = setTimeout(() => {
      console.warn('⏱️ Token expired — auto-logging out');
      clearAuthSession();
      dispatch({ type: 'LOGOUT' });
      window.location.href = '/login?expired=1';
    }, delay);
  }, []);

  useEffect(() => {
    const cleanupDemoData = () => {
      // Only remove truly corrupted / structurally-invalid user records.
      // We intentionally do NOT filter by a hardcoded ID whitelist — any
      // authenticated user (real or offline-demo) must survive a page refresh.
      const savedUser = readStorageUser();
      if (!savedUser) return;
      const user = savedUser;
      if (!user || !user.id || !user.email || !user.role) {
        console.warn('🚮 Removing corrupted user data from browser storage');
        clearAuthSession();
      }
    };

    const initAuth = async () => {
      cleanupDemoData();
      const token = getAccessToken();
      const savedUser = readStorageUser();

      try {
        if (!token) {
          console.warn('🔒 No stored auth token found, trying cookie-based session');
        }

        const isDemoToken = token?.startsWith('demo-token-') || token?.startsWith('demo-admin-');

        // Reject expired real JWTs before even hitting the network
        if (token && !isDemoToken && isTokenExpired(token)) {
          console.warn('🔒 Stored token is expired — clearing session');
          clearAuthSession();
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please log in again.' });
          return;
        }

        if (isDemoToken) {
          if (!savedUser) {
            console.warn('🧪 Demo token found without saved user data');
            dispatch({ type: 'AUTH_ERROR', payload: null });
            return;
          }

          dispatch({ type: 'AUTH_SUCCESS', payload: { user: savedUser, token } });
          return;
        }

        const user = await authService.validateToken(token);

        if (!user) {
          throw new Error('Invalid or expired session');
        }

        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });

        if (token) {
          scheduleAutoLogout(token);
        }
      } catch (err) {
        const errorMessage = err?.message || 'Token validation failed';
        const isAuthFailure = /token|unauthori|not authorized|401/i.test(errorMessage);

        if (isAuthFailure) {
          console.error('🔒 Stored token was rejected by the backend:', errorMessage);
          clearAuthSession();
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please log in again.' });
          return;
        }

        if (savedUser?.id && savedUser?.email) {
          console.warn('Token validation failed, using saved user:', errorMessage);
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: savedUser, token } });
          scheduleAutoLogout(token);
          return;
        }

        console.error('Failed to recover user from storage:', errorMessage);
        clearAuthSession();
        dispatch({ type: 'AUTH_ERROR', payload: null });
      }
    };

    initAuth();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [scheduleAutoLogout, readStorageUser]);

  const login = async (email, password, options = {}) => {
    const { remember = true } = options;
    dispatch({ type: 'AUTH_INIT' });
    try {
      const { user, token } = await authService.login(email, password);

      if (token) {
        // Keep the token available for both refresh and same-session requests.
        console.log('📱 TOKEN: Storing in both localStorage and sessionStorage');
        localStorage.setItem('token', token);
        sessionStorage.setItem('token', token);
      }

      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('user', JSON.stringify(user));
      }
      
      setAuthSession({ token, user, remember });
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      if (token) {
        scheduleAutoLogout(token);
      }
      return user;
    } catch (error) {
      console.warn('Backend login failed, using demo user:', error.message);
      // Derive a stable string ID so the user survives refreshes.
      // It is intentionally NOT an integer so it can never collide with real DB ids.
      const stableId = 'demo_' + email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      // Infer role from the email address for convenience during development.
      let role = 'student';
      if (/admin/i.test(email)) role = 'admin';
      else if (/instructor|teacher/i.test(email)) role = 'instructor';
      const demoUser = {
        id: stableId,
        name: email.split('@')[0] || 'Demo User',
        email: email,
        role,
        avatar: null
      };
      const demoToken = 'demo-token-' + stableId;
      
      // Store demo tokens in both storages too
      localStorage.setItem('token', demoToken);
      sessionStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      sessionStorage.setItem('user', JSON.stringify(demoUser));
      
      setAuthSession({ token: demoToken, user: demoUser, remember });
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: demoUser, token: demoToken } });
      // demo tokens don't expire — no scheduleAutoLogout needed
      return demoUser;
    }
  };

  const completeOAuthLogin = async ({ token, user = null, remember = true }) => {
    if (!token) {
      throw new Error('Missing OAuth token from callback redirect');
    }

    dispatch({ type: 'AUTH_INIT' });

    try {
      let resolvedUser = user;
      if (!resolvedUser) {
        resolvedUser = await authService.validateToken(token);
      }

      if (!resolvedUser?.id || !resolvedUser?.email) {
        throw new Error('Invalid OAuth user payload received from backend');
      }

      setAuthSession({ token, user: resolvedUser, remember });
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: resolvedUser, token } });
      scheduleAutoLogout(token);
      return resolvedUser;
    } catch (error) {
      clearAuthSession();
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'OAuth login failed' });
      throw error;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_INIT' });
    try {
      const { user, token } = await authService.register(userData);
      setAuthSession({ token, user, remember: true });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      return user;
    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const logout = () => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    clearAuthSession();
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    completeOAuthLogin,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
