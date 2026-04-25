function ensureHttps(url) {
  if (!url) return '';
  if (url.startsWith('https://')) return url;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return `https://${url}`;
}

const DEFAULT_BACKEND_URL = 'https://sanjeev-e-learn-pro-backend-1.onrender.com';

function sanitizeBackendUrl(rawUrl, fallbackUrl) {
  const normalized = ensureHttps((rawUrl || '').trim());
  if (!normalized) return fallbackUrl;

  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
      return fallbackUrl;
    }
    return normalized;
  } catch {
    return fallbackUrl;
  }
}

export const API_URL = sanitizeBackendUrl(import.meta.env.VITE_API_URL, DEFAULT_BACKEND_URL);
export const SOCKET_URL = sanitizeBackendUrl(import.meta.env.VITE_SOCKET_URL || API_URL, API_URL);
