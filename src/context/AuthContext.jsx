import { useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as authService from '../services/authApi';
import { AuthContext } from './auth-context';

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

  useEffect(() => {
    const cleanupDemoData = () => {
      // Clean up any demo data from localStorage
      const realUserIds = [33, 34, 35, 36, 49, 50, 51, 52, 53];
      
      // Check if current user is a demo user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.id && !realUserIds.includes(user.id)) {
            console.warn('🚮 Removing demo user from localStorage:', user);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (parseError) {
          console.warn('Error parsing saved user during cleanup:', parseError.message);
        }
      }
      
      // Clean up demo enrollments
      const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
      const cleanedEnrollments = enrollments.filter(enrollment => 
        realUserIds.includes(enrollment.user_id)
      );
      if (cleanedEnrollments.length !== enrollments.length) {
        console.warn('🧹 Cleaned demo enrollments from localStorage');
        localStorage.setItem('enrollments', JSON.stringify(cleanedEnrollments));
      }
    };

    const initAuth = async () => {
      // Clean up demo data first
      cleanupDemoData();
      
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Try to validate with backend first
          const user = await authService.validateToken(token);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token }
          });
        } catch (err) {
          console.warn('Token validation failed, using saved user:', err.message);
          
          // Fallback to saved user for offline mode
          try {
            const user = JSON.parse(savedUser);
            // Validate user has required fields
            if (!user.id || !user.email) {
              throw new Error('Invalid saved user data');
            }
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token }
            });
          } catch (parseError) {
            console.error('Failed to parse saved user:', parseError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({
              type: 'AUTH_ERROR',
              payload: null
            });
          }
        }
      } else {
        dispatch({ 
          type: 'AUTH_ERROR', 
          payload: null 
        });
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_INIT' });
    try {
      const { user, token } = await authService.login(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      });
      return user;
    } catch (error) {
      console.warn('Backend login failed, using demo user:', error.message);
      
      // Create a demo user for offline mode with unique ID based on email
      const emailHash = email.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const uniqueId = Math.abs(emailHash) || Date.now();
      
      const demoUser = {
        id: uniqueId,
        name: email.split('@')[0] || 'Demo User',
        email: email,
        role: 'student',
        avatar: null
      };
      const demoToken = 'demo-token-' + Date.now();
      
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: demoUser, token: demoToken }
      });
      
      return demoUser;
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_INIT' });
    try {
      const { user, token } = await authService.register(userData);
      localStorage.setItem('token', token);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    ...state,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
