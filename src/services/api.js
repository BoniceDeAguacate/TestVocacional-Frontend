import axios from 'axios';
import { useAlert } from '@/composables/useAlert'

// Debug: verificar qué URL se está usando
const apiUrl = import.meta.env.VITE_API_URL || 'https://ingaguacate.site/api';

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuestas: si recibimos 401 (token expirado/no autorizado)
// limpiamos el almacenamiento local y redirigimos al login.
let handlingAuthError = false;
api.interceptors.response.use(
  response => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    // No tratar los 401 provenientes del proceso de login/registro como "sesión expirada",
    // para que el componente de autenticación maneje las credenciales inválidas.
    if (requestUrl.includes('/users/login') || requestUrl.includes('/users/register')) {
      return Promise.reject(error);
    }
    if (status === 401 && !handlingAuthError) {
      handlingAuthError = true;
      try {
        // Limpiar datos de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('curp');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
      } catch (e) {
        // ignore
      }

      // Usar SweetAlert2 a través del composable useAlert
      try {
        const { showError } = useAlert()
        await showError('Tu sesión ha expirado. Serás redirigido al inicio de sesión.', 'Sesión expirada')
      } catch (e) {
        // fallback: si falla, usar alert
        try { window.alert('Tu sesión ha expirado. Serás redirigido al inicio de sesión.'); } catch (_) {}
      }

      // Redirigir al login de la aplicación
      const loginPath = '/login';
      window.location.replace(loginPath);
    }

    return Promise.reject(error);
  }
);

export default api;
