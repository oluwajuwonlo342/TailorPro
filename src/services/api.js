import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://tailorprobackend.onrender.com/api',
});

const PUBLIC_ROUTES = ['/admin/login', '/auth/login', '/auth/register'];

// FIXED: Using .includes() prevents full URLs (http://...) from breaking the redirect logic
const isAdminRoute = (url = '') => url.includes('/admin');
const isPublicRoute = (url = '') => PUBLIC_ROUTES.some((r) => url.includes(r));

// Request Interceptor: Attach token
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    if (!isPublicRoute(url)) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401 && !isPublicRoute(url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      const targetRoute = isAdminRoute(url) ? '/admin/login' : '/login';
      
      if (window.location.pathname !== targetRoute) {
        window.location.href = targetRoute;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
