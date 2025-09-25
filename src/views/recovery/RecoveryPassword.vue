<template>
  <div class="recovery-container">
    <div class="recovery-card">
      <img src="/UPQROO-logo.png" alt="Logo UPQROO" class="logo" />
      
      <!-- Paso 1: Solicitar email -->
      <div v-if="step === 1" class="step-container">
        <h2>Recuperar Contraseña</h2>
        <p class="step-description">
          Ingresa tu correo electrónico para recibir un código de verificación
        </p>
        
        <form @submit.prevent="sendCode" class="recovery-form">
          <div class="form-group">
            <label for="email">Correo Electrónico</label>
            <input 
              id="email"
              v-model="email" 
              type="email" 
              required 
              placeholder="usuario@ejemplo.com"
              :disabled="loading"
            />
          </div>
          
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Enviando...' : 'Enviar Código' }}
          </button>
        </form>
      </div>

      <!-- Paso 2: Verificar código -->
      <div v-if="step === 2" class="step-container">
        <h2>Verificar Código</h2>
        <p class="step-description">
          Ingresa el código de verificación enviado a: <strong>{{ email }}</strong>
        </p>
        
        <form @submit.prevent="verifyCodeSubmit" class="recovery-form">
          <div class="form-group">
            <label for="code">Código de Verificación</label>
            <input 
              id="code"
              v-model="code" 
              type="text" 
              required 
              placeholder="123456"
              maxlength="6"
              :disabled="loading"
              class="code-input"
            />
          </div>
          
          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Verificando...' : 'Verificar Código' }}
          </button>
          
          <button 
            type="button" 
            @click="goBack" 
            class="btn-secondary"
            :disabled="loading"
          >
            Volver
          </button>
        </form>
        
        <!-- Opción para solicitar nuevo código -->
        <div class="resend-code-section">
          <p class="resend-text">¿No recibiste el código?</p>
          <button 
            type="button" 
            @click="resendCode" 
            class="btn-link"
            :disabled="loading"
          >
            Solicitar nuevo código
          </button>
        </div>
      </div>

      <!-- Paso 3: Nueva contraseña -->
      <div v-if="step === 3" class="step-container">
        <h2>Nueva Contraseña</h2>
        <p class="step-description">
          Ingresa tu nueva contraseña (mínimo 6 caracteres)
        </p>
        
        <form @submit.prevent="changePassword" class="recovery-form">
          <div class="form-group">
            <label for="newPassword">Nueva Contraseña</label>
            <input 
              id="newPassword"
              v-model="newPassword" 
              type="password" 
              required 
              minlength="6"
              placeholder="Mínimo 6 caracteres"
              :disabled="loading"
            />
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirmar Contraseña</label>
            <input 
              id="confirmPassword"
              v-model="confirmPassword" 
              type="password" 
              required 
              minlength="6"
              placeholder="Repite la contraseña"
              :disabled="loading"
            />
          </div>
          
          <button type="submit" :disabled="loading || !passwordsMatch" class="btn-primary">
            {{ loading ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
          
          <button 
            type="button" 
            @click="goBack" 
            class="btn-secondary"
            :disabled="loading"
          >
            Volver
          </button>
        </form>
        
        <div v-if="newPassword && confirmPassword && newPassword !== confirmPassword" class="error-message">
          Las contraseñas no coinciden
        </div>
        <div v-if="newPassword && newPassword.length > 0 && newPassword.length < 6" class="error-message">
          La contraseña debe tener al menos 6 caracteres
        </div>
      </div>

      <!-- Mensajes de error y éxito -->
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">{{ success }}</div>
      
      <!-- Enlace para volver al login -->
      <div class="back-to-login">
        <a @click="goToLogin" href="#">Volver al inicio de sesión</a>
      </div>
    </div>
    
    <!-- Modal de éxito -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="success-icon">✓</div>
          <h3>¡Contraseña Cambiada!</h3>
        </div>
        <div class="modal-body">
          <p>Tu contraseña ha sido actualizada exitosamente.</p>
          <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
        </div>
        <div class="modal-footer">
          <button @click="acceptModal" class="btn-modal-accept">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPassword, verifyCode, resetPassword } from '@/services/recoveryService'

const router = useRouter()

// Estado reactivo
const step = ref(1)
const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const showSuccessModal = ref(false)

// Computed properties
const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value && newPassword.value.length >= 6
})



// Funciones
const clearMessages = () => {
  error.value = ''
  success.value = ''
}

const sendCode = async () => {
  clearMessages()
  loading.value = true
  
  try {
    const result = await forgotPassword(email.value)
    
    if (result.success) {
      success.value = 'Código de recuperación enviado. Revisa tu correo electrónico.'
      setTimeout(() => {
        step.value = 2
        clearMessages()
      }, 2000)
    } else {
      // Manejar mensaje de cooldown específicamente
      if (result.cooldown) {
        error.value = `⏰ ${result.message}`
      } else {
        error.value = result.message
      }
    }
  } catch (err) {
    error.value = 'Error inesperado. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const verifyCodeSubmit = async () => {
  clearMessages()
  loading.value = true
  
  try {
    const result = await verifyCode(email.value, code.value)
    
    if (result.success && result.valid) {
      step.value = 3
      clearMessages()
    } else {
      error.value = result.message || 'Código inválido o expirado'
    }
  } catch (err) {
    error.value = 'Error inesperado. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (newPassword.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  
  clearMessages()
  loading.value = true
  
  try {
    const result = await resetPassword(email.value, code.value, newPassword.value)
    
    if (result.success) {
      clearMessages()
      showSuccessModal.value = true
    } else {
      error.value = result.message
    }
  } catch (err) {
    error.value = 'Error inesperado. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  clearMessages()
  if (step.value > 1) {
    step.value--
  }
}

const goToLogin = () => {
  router.push('/login')
}

const resendCode = async () => {
  clearMessages()
  loading.value = true
  
  try {
    const result = await forgotPassword(email.value)
    
    if (result.success) {
      success.value = 'Nuevo código enviado. Revisa tu correo electrónico.'
      code.value = '' // Limpiar el código anterior
    } else {
      if (result.cooldown) {
        error.value = `⏰ ${result.message}`
      } else {
        error.value = result.message
      }
    }
  } catch (err) {
    error.value = 'Error inesperado. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showSuccessModal.value = false
}

const acceptModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');

.recovery-container, .recovery-container *, .recovery-card h2, .logo {
  font-family: 'Nunito', Arial, sans-serif !important;
}

.recovery-container {
  --color-principal: #FF671F;
  --color-secundario: #5B3427;
  --negro: #161616;
  --gris-claro: #f5f5f5;
  --error-color: #d32f2f;
  --success-color: #388e3c;
  
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  padding: 20px;
}

.recovery-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(91,52,39,0.08);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  border: 2px solid var(--color-secundario);
}

.logo {
  width: 120px;
  margin: 0 auto 1.2rem auto;
  display: block;
}

.step-container h2 {
  color: var(--color-secundario);
  margin-bottom: 0.5rem;
  font-weight: 700;
  font-size: 1.6rem;
  text-align: center;
}

.step-description {
  color: var(--negro);
  margin-bottom: 1.5rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

.recovery-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--negro);
  font-weight: 500;
  font-size: 1rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid lightgray;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  outline: none;
  box-shadow: 0 2px 4px rgba(91,52,39,0.08);
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  border: 2.5px solid var(--color-secundario);
  box-shadow: 0 0 0 2px rgba(91,52,39,0.15);
}

.form-group input:disabled {
  background-color: var(--gris-claro);
  cursor: not-allowed;
}

.code-input {
  text-align: center;
  font-size: 1.2rem !important;
  letter-spacing: 0.3rem;
  font-weight: bold;
  border: 2px solid var(--color-principal) !important;
}

.btn-primary {
  width: 100%;
  padding: 0.7rem;
  background: var(--color-principal);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}



.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  width: 100%;
  padding: 0.7rem;
  background: transparent;
  color: var(--color-secundario);
  border: 2px solid var(--color-secundario);
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
}



.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--error-color);
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.success-message {
  color: var(--success-color);
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.back-to-login {
  margin-top: 1.5rem;
  text-align: center;
}

.back-to-login a {
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  font-size: 0.9rem;
}

/* Estilos para solicitar nuevo código */
.resend-code-section {
  margin-top: 1.5rem;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.resend-text {
  color: var(--negro);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0;
}

.btn-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Estilos para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(91,52,39,0.15);
  max-width: 400px;
  width: 90%;
  margin: 20px;
  border: 2px solid var(--color-secundario);
}

.modal-header {
  text-align: center;
  padding: 2rem 2rem 1rem 2rem;
}

.success-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--success-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 1rem auto;
}

.modal-header h3 {
  color: var(--color-secundario);
  margin: 0;
  font-weight: 700;
  font-size: 1.5rem;
  font-family: 'Nunito', Arial, sans-serif !important;
}

.modal-body {
  padding: 0 2rem 1.5rem 2rem;
  text-align: center;
}

.modal-body p {
  color: var(--negro);
  margin-bottom: 0.5rem;
  line-height: 1.5;
  font-size: 1rem;
}

.modal-footer {
  padding: 0 2rem 2rem 2rem;
}

.btn-modal-accept {
  width: 100%;
  padding: 0.8rem;
  background: var(--color-principal);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  font-family: 'Nunito', Arial, sans-serif !important;
}



/* Responsive design */
@media (max-width: 480px) {
  .recovery-container {
    padding: 10px;
  }
  
  .recovery-card {
    padding: 1.5rem;
    margin: 0;
    max-width: 100%;
  }
  
  .step-container h2 {
    font-size: 1.4rem;
  }
  
  .logo {
    width: 100px;
    margin-bottom: 1rem;
  }
  
  .form-group input {
    padding: 0.6rem;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.8rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .modal-body {
    padding: 0 1.5rem 1rem 1.5rem;
  }
  
  .modal-footer {
    padding: 0 1.5rem 1.5rem 1.5rem;
  }
  
  .success-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
  
  .modal-header h3 {
    font-size: 1.3rem;
  }
  
  .resend-code-section {
    margin-top: 1rem;
  }
}
</style>