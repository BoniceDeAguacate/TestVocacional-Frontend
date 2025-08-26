import api from '../api'

/**
 * Obtiene el dashboard de administrador con paginación
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} pageSize - Tamaño de página (por defecto 10)
 * @returns {Promise<Object>} - Respuesta del API con lista de usuarios y metadatos de paginación
 */
export const obtenerDashboardAdmin = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/admin/dashboard', {
      params: {
        page,
        pageSize
      }
    })

    return {
      success: true,
      data: response.data,
      message: 'Dashboard cargado exitosamente'
    }
  } catch (error) {
    console.error('Error al obtener dashboard de admin:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al cargar el dashboard'
    }
  }
}

/**
 * Obtiene información detallada de un usuario específico
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} - Respuesta del API con datos del usuario
 */
export const obtenerUsuario = async (usuarioId) => {
  try {
    const response = await api.get(`/admin/users/${usuarioId}`)

    return {
      success: true,
      data: response.data,
      message: 'Usuario cargado exitosamente'
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al cargar el usuario'
    }
  }
}

/**
 * Obtiene la lista completa de usuarios para gestión con paginación
 * @param {number} page - Número de página (por defecto 1)
 * @param {number} pageSize - Tamaño de página (por defecto 10)
 * @returns {Promise<Object>} - Respuesta del API con lista de usuarios y metadatos de paginación
 */
export const obtenerTodosLosUsuarios = async (page = 1, pageSize = 10) => {
  try {
    const response = await api.get('/admin/users', {
      params: {
        page,
        pageSize
      }
    })

    return {
      success: true,
      data: response.data,
      message: 'Usuarios cargados exitosamente'
    }
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al cargar los usuarios'
    }
  }
}

/**
 * Formatea el nombre de la carrera recomendada
 * @param {string|null} carrera - Nombre de la carrera
 * @returns {string} - Nombre formateado de la carrera
 */
export const formatearNombreCarrera = (carrera) => {
  if (!carrera) return 'Sin carrera asignada'
  
  const nombres = {
    'salud': 'Ciencias de la Salud',
    'ingenieria': 'Ingeniería',
    'humanistica': 'Ciencias Humanísticas',
    'exactas': 'Ciencias Exactas',
    'economica': 'Ciencias Económicas',
    'defensa': 'Defensa y Seguridad',
    'artistica': 'Artísticas'
  }
  
  return nombres[carrera] || carrera.charAt(0).toUpperCase() + carrera.slice(1)
}

/**
 * Obtiene el icono correspondiente a cada carrera
 * @param {string|null} carrera - Nombre de la carrera
 * @returns {string} - Emoji del icono
 */
export const obtenerIconoCarrera = (carrera) => {
  if (!carrera) return '❓'
  
  const iconos = {
    'salud': '🏥',
    'ingenieria': '⚙️',
    'humanistica': '📚',
    'exactas': '🔬',
    'economica': '💼',
    'defensa': '🛡️',
    'artistica': '🎨'
  }
  
  return iconos[carrera] || '📖'
}

/**
 * Obtiene el color correspondiente a cada carrera
 * @param {string|null} carrera - Nombre de la carrera
 * @returns {string} - Clase CSS para el color
 */
export const obtenerColorCarrera = (carrera) => {
  if (!carrera) return 'sin-carrera'
  
  const colores = {
    'salud': 'salud',
    'ingenieria': 'ingenieria', 
    'humanistica': 'humanistica',
    'exactas': 'exactas',
    'economica': 'economica',
    'defensa': 'defensa',
    'artistica': 'artistica'
  }
  
  return colores[carrera] || 'default'
}

/**
 * Obtiene el estado del test de un usuario
 * @param {Object} usuario - Objeto usuario con resumen
 * @returns {string} - Estado del test: 'completado', 'parcial', 'pendiente'
 */
export const obtenerEstadoTest = (usuario) => {
  if (!usuario.resumen || usuario.resumen.total_respuestas === 0) {
    return 'pendiente'
  }
  
  if (usuario.resumen.total_respuestas > 0 && usuario.carrera_recomendada) {
    return 'completado'
  }
  
  return 'parcial'
}

/**
 * Actualiza un usuario específico
 * @param {number} id - ID del usuario a actualizar
 * @param {Object} datosUsuario - Datos del usuario a actualizar
 * @param {string} datosUsuario.email - Email del usuario
 * @param {string} datosUsuario.password - Password del usuario (opcional)
 * @param {string} datosUsuario.nombre - Nombre del usuario
 * @param {string} datosUsuario.apellidos - Apellidos del usuario
 * @param {string} datosUsuario.role - Rol del usuario
 * @returns {Promise<Object>} - Respuesta del API con datos actualizados
 */
export const actualizarUsuario = async (id, datosUsuario) => {
  try {
    const response = await api.put(`/admin/users/${id}`, datosUsuario)

    return {
      success: true,
      data: response.data,
      message: 'Usuario actualizado exitosamente'
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al actualizar el usuario'
    }
  }
}

/**
 * Elimina un usuario por ID
 * @param {string|number} id - ID del usuario a eliminar
 * @returns {Promise<Object>} - Respuesta del API
 */
export const eliminarUsuario = async (id) => {
  try {
    const response = await api.delete(`/admin/users/${id}`)

    return {
      success: true,
      data: response.data,
      message: 'Usuario eliminado exitosamente'
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al eliminar el usuario'
    }
  }
}

/**
 * Elimina los resultados del test de un usuario por CURP
 * @param {string} curp - CURP del usuario
 * @returns {Promise<Object>} - Respuesta del API
 */
export const borrarResultadosUsuario = async (curp) => {
  try {
    const response = await api.delete(`/resultados/curp/${curp}`)

    return {
      success: true,
      data: response.data,
      message: 'Resultados eliminados exitosamente'
    }
  } catch (error) {
    console.error('Error al borrar resultados:', error)
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Error al eliminar los resultados'
    }
  }
}
