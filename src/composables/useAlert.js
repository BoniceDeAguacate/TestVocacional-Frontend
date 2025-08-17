import Swal from 'sweetalert2'

export const useAlert = () => {
  // Configuración base para todas las alertas
  const baseConfig = {
    customClass: {
      popup: 'swal2-popup-nunito'
    }
  }

  // Función para mostrar alertas de éxito
  const showSuccess = (message, title = '¡Éxito!') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'success',
      title: title,
      text: message,
      confirmButtonText: 'OK'
    })
  }

  // Función para mostrar alertas de error
  const showError = (message, title = 'Error') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'error',
      title: title,
      text: message,
      confirmButtonText: 'OK'
    })
  }

  // Función para mostrar alertas de advertencia
  const showWarning = (message, title = 'Advertencia') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonText: 'OK'
    })
  }

  // Función para mostrar alertas de información
  const showInfo = (message, title = 'Información') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'info',
      title: title,
      text: message,
      confirmButtonText: 'OK'
    })
  }

  // Función para mostrar alertas de confirmación
  const showConfirm = (message, title = 'Confirmar acción') => {
    return Swal.fire({
      ...baseConfig,
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    })
  }

  // Función genérica para alertas personalizadas
  const showAlert = (config) => {
    return Swal.fire({ ...baseConfig, ...config })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    showAlert
  }
}
