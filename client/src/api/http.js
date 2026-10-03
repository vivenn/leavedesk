import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Auth lives in an httpOnly cookie set by the server, so the browser must send credentials
export const http = axios.create({ baseURL, withCredentials: true });

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const isSessionCheck = error.config?.url === '/auth/me';
    if (error.response?.status === 401 && !isSessionCheck) {
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function apiMessage(error, fallback = 'Something went wrong') {
  return error?.response?.data?.message || error?.message || fallback;
}
