import api from './api'

/**
 * Solicita un código de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/recovery/forgot-password', { email })
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Código de recuperación enviado al email'
    }
  } catch (error) {
    
    // Manejar error 429 (cooldown) específicamente
    if (error.response?.status === 429) {
      return {
        success: false,
        message: error.response.data.message || 'Debes esperar antes de solicitar otro código',
        cooldown: true
      }
    }
    
    const msg = error.response?.data?.message || error.message || 'Error al enviar código de recuperación'
    return {
      success: false,
      message: msg
    }
  }
}

/**
 * Verifica el código de recuperación
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const verifyCode = async (email, code) => {
  try {
    const response = await api.post('/recovery/verify-code', { email, code })
    
    // Basado en el backend: verifyResetCode retorna true/false
    // Si llega aquí sin error, el código es válido
    const result = {
      success: true,
      data: response.data,
      valid: true, // Si no hay error HTTP, el código es válido
      message: response.data.message || 'Código verificado correctamente'
    }
    return result
  } catch (error) {
    
    // Manejar diferentes tipos de error
    let message = 'Código inválido o expirado'
    if (error.response?.status === 400) {
      message = 'Código inválido o expirado'
    } else if (error.response?.status === 404) {
      message = 'No se encontró una solicitud de recuperación para este email'
    }
    
    return {
      success: false,
      valid: false,
      message: error.response?.data?.message || message
    }
  }
}

/**
 * Restablece la contraseña del usuario
 * @param {string} email - Email del usuario
 * @param {string} code - Código de verificación
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const resetPassword = async (email, code, newPassword) => {
  try {
    // El endpoint espera: email, code, password
    const payload = { 
      email, 
      code, 
      password: newPassword  // Cambiado de 'newPassword' a 'password'
    }
    const response = await api.post('/recovery/reset-password', payload)
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Contraseña actualizada correctamente'
    }
  } catch (error) {
    
    // Manejar errores específicos basados en el backend
    let message = 'Error al restablecer contraseña'
    
    if (error.response?.status === 400) {
      // Error de validación (contraseña muy corta, código inválido, etc.)
      message = error.response.data.message || 'Código inválido, expirado o contraseña muy corta'
    } else if (error.response?.status === 404) {
      message = 'No se encontró el usuario o el código ya fue utilizado'
    } else if (error.response?.status === 410) {
      message = 'El código de recuperación ha expirado. Solicita uno nuevo'
    }
    
    return {
      success: false,
      message: error.response?.data?.message || message
    }
  }
}