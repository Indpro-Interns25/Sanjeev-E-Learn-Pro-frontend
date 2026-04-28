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
  const fromLocal = localStorage.getItem(key);
  if (fromLocal) return fromLocal;

  const fromSession = sessionStorage.getItem(key);
  if (fromSession) return fromSession;

  return null;
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
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    if (remember) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  }

  if (user) {
    const serializedUser = JSON.stringify(user);

    if (remember) {
      localStorage.setItem(USER_KEY, serializedUser);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, serializedUser);
      localStorage.removeItem(USER_KEY);
    }
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
