import axios from 'axios';

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
  (error) => {
    const status = error.response?.status;
    if (status === 401 && !handlingAuthError) {
      handlingAuthError = true;
      try {
        // Limpiar datos de sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (e) {
        // ignore
      }
      // Informar al usuario (fallback simple)
      try {
        // Evitar usar librerías de UI aquí; usar alert como fallback
        window.alert('Tu sesión ha expirado. Serás redirigido al inicio de sesión.');
      } catch (e) {}

      // Redirigir al login de la aplicación
      // Usamos location.replace para no permitir volver a la página con el token expirado
      const loginPath = '/login';
      window.location.replace(loginPath);
    }

    return Promise.reject(error);
  }
);

export default api;
