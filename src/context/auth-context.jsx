import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  token: null,
  loading: true,
  error: null,
  login: () => {},
  completeOAuthLogin: () => {},
  register: () => {},
  logout: () => {}
});
