# 🚨 Sistema de Alertas con SweetAlert2

Sistema simple para mostrar alertas usando SweetAlert2 con estilos por defecto.

## 📁 Archivos

- `src/composables/useAlert.js` - Composable principal para las alertas
- `src/components/examples/AlertExamples.vue` - Componente de ejemplo

## 🚀 Uso

### 1. Importar el composable

```javascript
import { useAlert } from '@/composables/useAlert'

const { showSuccess, showError, showWarning, showInfo, showConfirm } = useAlert()
```

### 2. Usar las funciones

```javascript
// Alerta de éxito
showSuccess('¡Operación exitosa!', 'Título opcional')

// Alerta de error
showError('Algo salió mal', 'Error')

// Alerta de advertencia
showWarning('Cuidado con esto', 'Advertencia')

// Alerta de información
showInfo('Información importante', 'Info')

// Alerta de confirmación
const result = await showConfirm('¿Continuar?', 'Confirmar')
if (result.isConfirmed) {
  // Usuario confirmó
}
```

## 📝 Ejemplo en RegisterForm

```javascript
// Validar contraseñas
if (password.value !== confirmPassword.value) {
  showError('Las contraseñas no coinciden', 'Error de validación')
  return
}

// Registro exitoso
showSuccess('¡Cuenta creada exitosamente!', '¡Éxito!')
```

## ✨ Características

- Estilos por defecto de SweetAlert2
- 5 tipos de alertas: success, error, warning, info, confirm
- API simple y limpia
- Compatible con async/await
- Totalmente funcional sin configuración adicional
