import api from './api';

export async function login(curp, password) {
  try {
    const response = await api.post('/users/login', { curp, password });
    const { token, user, message } = response.data;
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('curp', curp); // Guardar CURP en localStorage
      localStorage.setItem('userRole', user.role || 'aspirante'); // Guardar rol del usuario
      localStorage.setItem('userName', `${user.nombre} ${user.apellidos}`); // Guardar nombre completo
    }
    return { success: true, message, user };
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Error al iniciar sesión';
    return { success: false, message: msg };
  }
}


export async function register(curp, email, password, nombre, apellidos) {
  try {
    const response = await api.post('/users/register', { curp, email, password, nombre, apellidos });
    return { success: true, message: response.data.message };
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Error al registrarse';
    return { success: false, message: msg };
  }
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('curp');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
}

/**
 * Obtiene el rol del usuario actual
 */
export function getUserRole() {
  return localStorage.getItem('userRole') || 'aspirante';
}

/**
 * Verifica si el usuario actual es administrador
 */
export function isAdmin() {
  return getUserRole() === 'admin';
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
  return !!localStorage.getItem('token');
}

// Puedes agregar más funciones según tus endpoints
