import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('domicilo_token');
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
      const refreshToken = localStorage.getItem('domicilo_refresh');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem('domicilo_token', accessToken);
          localStorage.setItem('domicilo_refresh', newRefresh);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('domicilo_token');
          localStorage.removeItem('domicilo_refresh');
          localStorage.removeItem('domicilo_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
