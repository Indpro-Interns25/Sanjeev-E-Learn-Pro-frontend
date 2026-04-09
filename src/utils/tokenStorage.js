const ACCESS_TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ADMIN_TOKEN_KEY = 'adminToken';
const ADMIN_DATA_KEY = 'adminData';

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readStorage(key) {
  const fromSession = sessionStorage.getItem(key);
  if (fromSession) return fromSession;
  return localStorage.getItem(key);
}

function removeFromAll(key) {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
}

export function getAccessToken() {
  return readStorage(ACCESS_TOKEN_KEY);
}

export function getAuthUser() {
  return safeParse(readStorage(USER_KEY));
}

export function setAuthSession({ token, user, remember = false }) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  if (token) {
    storage.setItem(ACCESS_TOKEN_KEY, token);
    otherStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user));
    otherStorage.removeItem(USER_KEY);
  }
}

export function clearAuthSession() {
  removeFromAll(ACCESS_TOKEN_KEY);
  removeFromAll(USER_KEY);
}

export function getAdminToken() {
  return readStorage(ADMIN_TOKEN_KEY);
}

export function setAdminSession({ token, admin, remember = false }) {
  const storage = remember ? localStorage : sessionStorage;
  const otherStorage = remember ? sessionStorage : localStorage;

  if (token) {
    storage.setItem(ADMIN_TOKEN_KEY, token);
    otherStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  if (admin) {
    storage.setItem(ADMIN_DATA_KEY, JSON.stringify(admin));
    otherStorage.removeItem(ADMIN_DATA_KEY);
  }
}

export function clearAdminSession() {
  removeFromAll(ADMIN_TOKEN_KEY);
  removeFromAll(ADMIN_DATA_KEY);
}
