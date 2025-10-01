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
      <label for="confirmEmail">Confirmar correo electrónico</label>
      <input 
        id="confirmEmail" 
        v-model="confirmEmail" 
        type="email" 
        required
        :class="{ 'input-error': confirmEmailError, 'input-valid': confirmEmailValid }"
        @input="validateConfirmEmail"
      />
      <div v-if="confirmEmailError" class="field-error">{{ confirmEmailErrorMessage }}</div>
      <div v-if="confirmEmailValid" class="field-success">✓ Los correos coinciden</div>
    </div>
    
    <!-- Nuevo campo: Escuela de procedencia -->
    <div>
      <label for="escuelaProcedencia">Escuela de procedencia</label>
      <select 
        id="escuelaProcedencia" 
        v-model="escuelaProcedencia" 
        required
        @change="handleEscuelaChange"
      >
        <option value="">Selecciona tu escuela</option>
        <option value="Colegio de bachilleres I">Colegio de bachilleres I</option>
        <option value="Colegio de bachilleres II">Colegio de bachilleres II</option>
        <option value="Colegio de bachilleres III">Colegio de bachilleres III</option>
        <option value="Colegio de bachilleres IV">Colegio de bachilleres IV</option>
        <option value="CECYTE I">CECYTE I</option>
        <option value="CECYTE II">CECYTE II</option>
        <option value="CECYTE III">CECYTE III</option>
        <option value="CECYTE IV">CECYTE IV</option>
        <option value="CBTIS 111">CBTIS 111</option>
        <option value="CBTIS 272">CBTIS 272</option>
        <option value="CERTMAR">CERTMAR</option>
        <option value="CONALEP 1">CONALEP 1</option>
        <option value="CONALEP 2">CONALEP 2</option>
        <option value="CONALEP 3">CONALEP 3</option>
        <option value="CONALEP 4">CONALEP 4</option>
        <option value="PRIVADA">PRIVADA</option>
        <option value="OTRO">OTRO</option>
      </select>
    </div>
    
    <!-- Campo adicional para "OTRO" -->
    <div v-if="escuelaProcedencia === 'OTRO'">
      <label for="otraEscuela">Especifica tu escuela</label>
      <input 
        id="otraEscuela" 
        v-model="otraEscuela" 
        placeholder="Ingresa el nombre de tu escuela"
        required
      />
    </div>
    
    <!-- Nuevo campo: Género -->
    <div>
      <label>Género</label>
      <div class="radio-group">
        <div class="radio-option">
          <input 
            id="genero-hombre" 
            type="radio" 
            v-model="genero" 
            value="Hombre" 
            required
          />
          <label for="genero-hombre" class="radio-label">Hombre</label>
        </div>
        <div class="radio-option">
          <input 
            id="genero-mujer" 
            type="radio" 
            v-model="genero" 
            value="Mujer" 
            required
          />
          <label for="genero-mujer" class="radio-label">Mujer</label>
        </div>
      </div>
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
const confirmEmail = ref('')
const password = ref('')
const confirmPassword = ref('')
// Nuevos campos
const escuelaProcedencia = ref('')
const otraEscuela = ref('')
const genero = ref('')

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

// Estados de validación de confirmación de email
const confirmEmailError = ref(false)
const confirmEmailValid = ref(false)
const confirmEmailErrorMessage = ref('')

function handleEscuelaChange() {
  // Limpiar el campo "otra escuela" si se selecciona una opción diferente a "OTRO"
  if (escuelaProcedencia.value !== 'OTRO') {
    otraEscuela.value = ''
  }
}

function validateEmail() {
  const emailValue = email.value
  
  if (emailValue.length === 0) {
    emailError.value = false
    emailValid.value = false
    emailErrorMessage.value = ''
    // Re-validar confirmación si hay contenido
    if (confirmEmail.value.length > 0) {
      validateConfirmEmail()
    }
    return
  }
  
  // Expresión regular para validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(emailValue)) {
    emailError.value = true
    emailValid.value = false
    emailErrorMessage.value = 'Ingresa un email válido (ejemplo: usuario@dominio.com)'
    // Re-validar confirmación si hay contenido
    if (confirmEmail.value.length > 0) {
      validateConfirmEmail()
    }
    return
  }
  
  emailError.value = false
  emailValid.value = true
  emailErrorMessage.value = ''
  
  // Re-validar confirmación si hay contenido
  if (confirmEmail.value.length > 0) {
    validateConfirmEmail()
  }
}

function validateConfirmEmail() {
  const confirmEmailValue = confirmEmail.value
  
  if (confirmEmailValue.length === 0) {
    confirmEmailError.value = false
    confirmEmailValid.value = false
    confirmEmailErrorMessage.value = ''
    return
  }
  
  // Verificar que el email principal sea válido primero
  if (emailError.value || email.value.length === 0) {
    confirmEmailError.value = true
    confirmEmailValid.value = false
    confirmEmailErrorMessage.value = 'Primero ingresa un email válido'
    return
  }
  
  // Verificar que los emails coincidan
  if (confirmEmailValue !== email.value) {
    confirmEmailError.value = true
    confirmEmailValid.value = false
    confirmEmailErrorMessage.value = 'Los correos electrónicos no coinciden'
    return
  }
  
  confirmEmailError.value = false
  confirmEmailValid.value = true
  confirmEmailErrorMessage.value = ''
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
  
  // Validar que los emails coincidan
  if (email.value !== confirmEmail.value) {
    showError('Los correos electrónicos no coinciden. Por favor, verifica que ambos sean iguales.', 'Error de validación')
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
  
  // Validar campos nuevos
  if (!escuelaProcedencia.value) {
    showError('Por favor selecciona tu escuela de procedencia.', 'Error de validación')
    return
  }
  
  if (escuelaProcedencia.value === 'OTRO' && !otraEscuela.value.trim()) {
    showError('Por favor especifica el nombre de tu escuela.', 'Error de validación')
    return
  }
  
  if (!genero.value) {
    showError('Por favor selecciona tu género.', 'Error de validación')
    return
  }
  
  // Determinar la escuela final a enviar
  const escuelaFinal = escuelaProcedencia.value === 'OTRO' ? otraEscuela.value.trim() : escuelaProcedencia.value
  
  const result = await registerService(
    curp.value, 
    email.value, 
    password.value, 
    nombre.value, 
    apellidos.value,
    escuelaFinal,
    genero.value
  )
  
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
.register-form input,
.register-form select {
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
.register-form input:focus,
.register-form select:focus {
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

/* Estilos para radio buttons de género */
.radio-group {
  display: flex;
  gap: 1rem;
  margin-top: 0.3rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.radio-option input[type="radio"] {
  width: auto;
  margin: 0;
}

.radio-label {
  margin: 0 !important;
  font-weight: 400;
  cursor: pointer;
}

/* Personalizar el select */
.register-form select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}
</style>
