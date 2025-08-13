import api from './api';


export async function login(curp, password) {
  try {
    const response = await api.post('/users/login', { curp, password });
    const { token, user, message } = response.data;
    if (token) {
      localStorage.setItem('token', token);
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

// Puedes agregar más funciones según tus endpoints
