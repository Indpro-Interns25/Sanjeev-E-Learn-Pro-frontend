import { API_URL, SOCKET_URL } from './api';

const isDevelopment = import.meta.env.DEV;

export { API_URL, SOCKET_URL, isDevelopment };
export const API_BASE_URL = API_URL;
