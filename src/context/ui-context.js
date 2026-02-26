import { createContext, useContext } from 'react';

export const UiContext = createContext({
  isLoading: false,
  toast: null,
  toasts: [],
  modal: null,
  darkMode: false,
  showLoading: () => {},
  hideLoading: () => {},
  showToast: () => {},
  removeToast: () => {},
  showModal: () => {},
  hideModal: () => {},
  toggleDarkMode: () => {},
  setDarkMode: () => {},
});

export function useUi() {
  return useContext(UiContext);
}
