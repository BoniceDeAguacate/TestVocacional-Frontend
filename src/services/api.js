import axios from 'axios';

// Debug: verificar qué URL se está usando
const apiUrl = import.meta.env.VITE_API_URL || 'https://ingaguacate.site:3000/api';
console.log('🔗 API URL configurada:', apiUrl);
console.log('📦 Variables de entorno:', import.meta.env);

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

export default api;
