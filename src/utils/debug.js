// Debug utilities for development

import { testRegistration } from './testRegistration';

// Function to check registered users in localStorage
export const getRegisteredUsers = () => {
  const storedUsers = localStorage.getItem('registeredUsers');
  return storedUsers ? JSON.parse(storedUsers) : {};
};

// Function to check user tokens in localStorage
export const getUserTokens = () => {
  const storedTokens = localStorage.getItem('userTokens');
  return storedTokens ? JSON.parse(storedTokens) : {};
};

// Function to clear all stored user data (for testing)
export const clearUserData = () => {
  localStorage.removeItem('registeredUsers');
  localStorage.removeItem('userTokens');
  localStorage.removeItem('token');
  console.warn('All user data cleared');
};

// Function to log all stored user data
export const logStoredData = () => {
  console.warn('Registered Users:', getRegisteredUsers());
  console.warn('User Tokens:', getUserTokens());
  console.warn('Current Token:', localStorage.getItem('token'));
};

// Add debug functions to window for browser console access
if (typeof window !== 'undefined') {
  window.debugAuth = {
    getRegisteredUsers,
    getUserTokens,
    clearUserData,
    logStoredData,
    testRegistration
  };
}