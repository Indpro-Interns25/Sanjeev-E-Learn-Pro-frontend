import { useReducer, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { UiContext } from './ui-context';

const DARK_MODE_KEY = 'edu_dark_mode';

const initialState = {
  isLoading: false,
  toasts: [],       // array of { id, message, type }
  toast: null,      // legacy single-toast compat
  modal: null,
  darkMode: localStorage.getItem(DARK_MODE_KEY) === 'true',
};

function uiReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: action.payload,
        toasts: [
          ...state.toasts.slice(-4), // keep max 5
          { id: action.payload.id, message: action.payload.message, type: action.payload.type },
        ],
      };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'SHOW_MODAL':
      return { ...state, modal: action.payload };
    case 'HIDE_MODAL':
      return { ...state, modal: null };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
    default:
      return state;
  }
}

export function UiProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Sync dark mode to DOM and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (state.darkMode) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark-mode');
    } else {
      root.removeAttribute('data-theme');
      root.classList.remove('dark-mode');
    }
    localStorage.setItem(DARK_MODE_KEY, String(state.darkMode));
  }, [state.darkMode]);

  const showLoading = useCallback(() => dispatch({ type: 'SET_LOADING', payload: true }), []);
  const hideLoading = useCallback(() => dispatch({ type: 'SET_LOADING', payload: false }), []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    dispatch({ type: 'SHOW_TOAST', payload: { id, message, type } });
    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
      dispatch({ type: 'HIDE_TOAST' });
    }, duration);
  }, []);

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE_TOAST', payload: id }), []);

  const showModal = useCallback((content, title) => {
    dispatch({ type: 'SHOW_MODAL', payload: { content, title } });
  }, []);

  const hideModal = useCallback(() => dispatch({ type: 'HIDE_MODAL' }), []);

  const toggleDarkMode = useCallback(() => dispatch({ type: 'TOGGLE_DARK_MODE' }), []);
  const setDarkMode = useCallback((val) => dispatch({ type: 'SET_DARK_MODE', payload: val }), []);

  const value = {
    ...state,
    showLoading,
    hideLoading,
    showToast,
    removeToast,
    showModal,
    hideModal,
    toggleDarkMode,
    setDarkMode,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

UiProvider.propTypes = {
  children: PropTypes.node.isRequired
};
