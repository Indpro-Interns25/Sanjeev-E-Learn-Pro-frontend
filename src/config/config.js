export const API_URL = import.meta.env.VITE_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

if (!API_URL || !SOCKET_URL) {
  console.error('Missing VITE_API_URL or VITE_SOCKET_URL environment variable');
}
