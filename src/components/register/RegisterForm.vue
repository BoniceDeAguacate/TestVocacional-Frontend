<template>
  <form class="register-form" @submit.prevent="handleRegister">
    <img src="/UPQROO-logo.png" alt="Logo UPQROO" class="logo" />
    <h2 class="register-title">Registrate</h2>
    <div>
      <label for="nombre">Nombre</label>
      <input id="nombre" v-model="nombre" required />
    </div>
    <div>
      <label for="apellidos">Apellidos</label>
      <input id="apellidos" v-model="apellidos" required />
    </div>
    <div>
      <label for="curp">CURP</label>
      <input id="curp" v-model="curp" required />
    </div>
    <div>
      <label for="email">Correo electrónico</label>
      <input 
        id="email" 
        v-model="email" 
        type="email" 
        required
        :class="{ 'input-error': emailError, 'input-valid': emailValid }"
        @input="validateEmail"
      />
      <div v-if="emailError" class="field-error">{{ emailErrorMessage }}</div>
      <div v-if="emailValid" class="field-success">✓ Email válido</div>
    </div>
    <div>
      <label for="password">Contraseña</label>
      <input 
        id="password" 
        type="password" 
        v-model="password" 
        required 
        minlength="6"
        :class="{ 'input-error': passwordError, 'input-valid': passwordValid }"
        @input="validatePassword"
      />
      <div v-if="passwordError" class="field-error">{{ passwordErrorMessage }}</div>
      <div v-if="passwordValid" class="field-success">✓ Contraseña válida</div>
    </div>
    <div>
      <label for="confirmPassword">Confirmar contraseña</label>
      <input id="confirmPassword" type="password" v-model="confirmPassword" required />
    </div>
    <button type="submit">Registrarse</button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">¡Registro exitoso! Ahora puedes iniciar sesión.</div>
    <div class="login-link">
      <span class="login-question">¿Ya tienes cuenta?</span>
      <a @click.prevent="goToLogin" href="#">Inicia sesión</a>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register as registerService } from '@/services/authService'
import { useAlert } from '@/composables/useAlert'

const { showError, showSuccess } = useAlert()

const nombre = ref('')
const apellidos = ref('')
const curp = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)
const router = useRouter()

// Estados de validación de contraseña
const passwordError = ref(false)
const passwordValid = ref(false)
const passwordErrorMessage = ref('')

// Estados de validación de email
const emailError = ref(false)
const emailValid = ref(false)
const emailErrorMessage = ref('')

function validateEmail() {
  const emailValue = email.value
  
  if (emailValue.length === 0) {
    emailError.value = false
    emailValid.value = false
    emailErrorMessage.value = ''
    return
  }
  
  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(emailValue)) {
    emailError.value = true
    emailValid.value = false
    emailErrorMessage.value = 'Ingresa un email válido (ejemplo: usuario@dominio.com)'
    return
  }
  
  emailError.value = false
  emailValid.value = true
  emailErrorMessage.value = ''
}

function validatePassword() {
  const passwordValue = password.value
  
  if (passwordValue.length === 0) {
    passwordError.value = false
    passwordValid.value = false
    passwordErrorMessage.value = ''
    return
  }
  
  if (passwordValue.length < 6) {
    passwordError.value = true
    passwordValid.value = false
    passwordErrorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  
  passwordError.value = false
  passwordValid.value = true
  passwordErrorMessage.value = ''
}

async function handleRegister() {
  error.value = ''
  success.value = false
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    showError('Por favor ingresa un email válido.', 'Error de validación')
    return
  }
  
  // Validar longitud de contraseña
  if (password.value.length < 6) {
    showError('La contraseña debe tener al menos 6 caracteres.', 'Error de validación')
    return
  }
  
  // Validar que las contraseñas coincidan
  if (password.value !== confirmPassword.value) {
    showError('Las contraseñas no coinciden. Por favor, verifica que ambas sean iguales.', 'Error de validación')
    return
  }
  
  const result = await registerService(curp.value, email.value, password.value, nombre.value, apellidos.value)
  if (result.success) {
    showSuccess('¡Tu cuenta ha sido creada exitosamente! Serás redirigido al login.', '¡Registro exitoso!')
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    showError(result.message || 'Ocurrió un error durante el registro.', 'Error en el registro')
  }
}

function goToLogin() {
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
.register-form, .register-form *, .register-title, .logo {
  font-family: 'Nunito', Arial, sans-serif !important;
}
.register-form {
  --color-principal: #FF671F;
  --color-secundario: #5B3427;
  --negro: #161616;
  width: 100%;
  font-family: 'Nunito', Arial, sans-serif;
}
.logo {
  width: 120px;
  margin: 0 auto 1.2rem auto;
  display: block;
}
.register-title {
  color: var(--negro);
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 1.5rem;
}
.register-form > div {
  margin-bottom: 1rem;
  width: 100%;
}
.register-form label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--negro);
  font-weight: 500;
}
.register-form input {
  width: 100%;
  padding: 0.5rem;
  border: 2px solid lightgray;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  color: var(--negro);
  outline: none;
  box-shadow: 0 2px 4px rgba(91,52,39,0.08);
  transition: border 0.2s, box-shadow 0.2s;
}
.register-form input:focus {
  border: 2.5px solid var(--color-secundario);
  box-shadow: 0 0 0 2px rgba(91,52,39,0.15);
}
.register-form button {
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
  transition: background 0.2s;
}
.register-form button:hover {
  background: var(--color-secundario);
}
.register-form .error {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
}
.register-form .success {
  color: #388e3c;
  margin-top: 1rem;
  text-align: center;
}
.register-form .login-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1rem;
}
.register-form .login-link .login-question {
  color: var(--color-secundario);
  font-weight: 600;
  margin-right: 0.3em;
}
.register-form .login-link a {
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 700;
}

/* Estilos para validación de contraseña */
.register-form input.input-error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.register-form input.input-valid {
  border-color: #388e3c;
  box-shadow: 0 0 0 3px rgba(56, 142, 60, 0.1);
}

.register-form .field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 5px;
  font-weight: 500;
}

.register-form .field-success {
  color: #388e3c;
  font-size: 0.8rem;
  margin-top: 5px;
  font-weight: 500;
}
</style>
