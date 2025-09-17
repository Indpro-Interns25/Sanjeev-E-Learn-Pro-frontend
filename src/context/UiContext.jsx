import { useReducer } from 'react';
import PropTypes from 'prop-types';
import { UiContext } from './ui-context';

const initialState = {
  isLoading: false,
  toast: null,
  modal: null
};

function uiReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    case 'SHOW_MODAL':
      return { ...state, modal: action.payload };
    case 'HIDE_MODAL':
      return { ...state, modal: null };
    default:
      return state;
  }
}

export function UiProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  const showLoading = () => dispatch({ type: 'SET_LOADING', payload: true });
  const hideLoading = () => dispatch({ type: 'SET_LOADING', payload: false });

  const showToast = (message, type = 'info') => {
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message, type }
    });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3000);
  };

  const showModal = (content, title) => {
    dispatch({
      type: 'SHOW_MODAL',
      payload: { content, title }
    });
  };

  const hideModal = () => dispatch({ type: 'HIDE_MODAL' });

  const value = {
    ...state,
    showLoading,
    hideLoading,
    showToast,
    showModal,
    hideModal
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

UiProvider.propTypes = {
  children: PropTypes.node.isRequired
};
