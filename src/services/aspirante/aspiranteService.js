import api from '../api';

/**
 * Obtiene los resultados del test vocacional para un aspirante
 * @param {string} curp - CURP del aspirante
 * @returns {Promise<Object>} Resultados del test
 */
export async function obtenerResultadosTest(curp) {
  try {
    const response = await api.get(`/resultados/reporte/curp/${curp}`);
    return { success: true, data: response.data };
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Error al obtener los resultados';
    return { success: false, message: msg };
  }
}

/**
 * Obtiene la CURP desde localStorage
 * @returns {string|null} CURP del usuario logueado
 */
export function obtenerCurpUsuario() {
  return localStorage.getItem('curp');
}
