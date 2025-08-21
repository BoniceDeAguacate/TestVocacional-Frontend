<template>
  <form class="login-form" @submit.prevent="handleLogin">
  <img src="/UPQROO-logo.png" alt="Logo UPQROO" class="logo" />
  <h1 class="login-title">Iniciar Sesión</h1>
    <div>
      <label for="curp">CURP</label>
      <input id="curp" v-model="curp" required />
    </div>
    <div>
      <label for="password">Contraseña</label>
      <input id="password" type="password" v-model="password" required />
    </div>
    <button type="submit">Entrar</button>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="success" class="success">¡Login exitoso!</div>
    <div class="register-link">
      <span class="register-question">¿No tienes cuenta?</span>
      <a @click.prevent="goToRegister" href="#">Regístrate aquí</a>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login as loginService } from '@/services/authService'

const emit = defineEmits(['login-success'])

const curp = ref('')
const password = ref('')
const error = ref('')
const success = ref(false)
const router = useRouter()

async function handleLogin() {
  error.value = ''
  success.value = false
  const result = await loginService(curp.value, password.value)
  if (result.success) {
    success.value = true
    emit('login-success')
    setTimeout(() => {
      success.value = false
      
      // Redireccionar según el rol del usuario
      const userRole = localStorage.getItem('userRole')
      if (userRole === 'admin') {
        router.push('/admin')
      } else {
        router.push('/aspirante')
      }
    }, 800)
  } else {
    error.value = result.message
  }
}

function goToRegister() {
  router.push('/register')
}
</script>

<style scoped>
.login-form, .login-form *, .login-title, .logo {
  font-family: 'Nunito', Arial, sans-serif !important;
}
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
.logo {
  width: 120px;
  margin: 0 auto 1.2rem auto;
  display: block;
}
.login-title {
  color: var(--negro);
  font-family: 'Nunito', Arial, sans-serif;
  
  text-align: center;
  margin-bottom: 1.5rem;
}
.login-form {
  --color-principal: #FF671F;
  --color-secundario: #5B3427;
  --negro: #161616;
  width: 100%;
  font-family: 'Nunito', Arial, sans-serif;
}
.login-form > div {
  margin-bottom: 1rem;
}
.login-form label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--negro);
  font-weight: 500;
}
.login-form input {
  width: 100%;
  padding: 0.5rem;
  border: 2px SOLID lightgray;
  border-radius: 6px;
  font-size: 1rem;
  font-family: 'Nunito', Arial, sans-serif;
  background: #fff;
  color: #222;
  outline: none;
  box-shadow: 0 2px 4px rgba(91,52,39,0.08);
  transition: border 0.2s, box-shadow 0.2s;
}
.login-form input:focus {
  border: 2.5px solid var(--color-secundario);
  box-shadow: 0 0 0 2px rgba(91,52,39,0.15);
}
.login-form button {
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
.login-form button:hover {
  background: var(--color-secundario);
}
.login-form .error {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
}
.login-form .success {
  color: #388e3c;
  margin-top: 1rem;
  text-align: center;
}
.login-form .register-link {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1rem;
}
.login-form .register-link .register-question {
  color: var(--color-secundario);
  font-weight: 600;
  margin-right: 0.3em;
}
.login-form .register-link a {
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 700;
}
</style>
