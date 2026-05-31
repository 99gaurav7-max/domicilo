import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

function safeGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}

api.interceptors.request.use((config) => {
  const token = safeGet('domicilo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = safeGet('domicilo_refresh');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          try {
            localStorage.setItem('domicilo_token', accessToken);
            localStorage.setItem('domicilo_refresh', newRefresh);
          } catch {}
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          try {
            localStorage.removeItem('domicilo_token');
            localStorage.removeItem('domicilo_refresh');
            localStorage.removeItem('domicilo_user');
          } catch {}
          window.location.href = '/login';
        }
      }
    }

    if (error.response?.status === 500) {
      error.response.data = error.response.data || {};
      error.response.data.error = 'Internal server error. Try again.';
    }

    return Promise.reject(error);
  }
);

export default api;
