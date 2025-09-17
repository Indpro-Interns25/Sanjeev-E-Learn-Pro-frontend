import { createContext } from 'react';

export const UiContext = createContext({
  isLoading: false,
  toast: null,
  modal: null,
  showLoading: () => {},
  hideLoading: () => {},
  showToast: () => {},
  showModal: () => {},
  hideModal: () => {}
});
