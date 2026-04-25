function ensureHttps(url) {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return `https://${url}`;
}

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const rawSocketUrl = (import.meta.env.VITE_SOCKET_URL || rawApiUrl).trim();

export const API_URL = ensureHttps(rawApiUrl);
export const SOCKET_URL = ensureHttps(rawSocketUrl || API_URL);
