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

      if (!token || !savedUser) {
        dispatch({ type: 'AUTH_ERROR', payload: null });
        return;
      }

      // Reject expired real JWTs before even hitting the network
      if (isTokenExpired(token)) {
        console.warn('🔒 Stored token is expired — clearing session');
        clearAuthSession();
        dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please log in again.' });
        return;
      }

      try {
        const user = await authService.validateToken(token);
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
        scheduleAutoLogout(token);
      } catch (err) {
        console.warn('Token validation failed, using saved user:', err.message);
        try {
          const user = savedUser;
          if (!user.id || !user.email) throw new Error('Invalid saved user data');
          dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          scheduleAutoLogout(token);
        } catch (parseError) {
          console.error('Failed to parse saved user:', parseError);
          clearAuthSession();
          dispatch({ type: 'AUTH_ERROR', payload: null });
        }
      }
    };

    initAuth();

    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [scheduleAutoLogout, readStorageUser]);

  const login = async (email, password, options = {}) => {
    const { remember = false } = options;
    dispatch({ type: 'AUTH_INIT' });
    try {
      const { user, token } = await authService.login(email, password);
      setAuthSession({ token, user, remember });
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      scheduleAutoLogout(token);
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
