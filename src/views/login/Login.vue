<template>
  <div class="login-container">
  <LoginForm />
  </div>
</template>

<script setup>
import LoginForm from '@/components/login/LoginForm.vue'
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
/* Colores institucionales */
:root {
  --color-principal: #FF671F;
  --color-secundario: #5B3427;
}

.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 2rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(91,52,39,0.08);
  font-family: 'Nunito', Arial, sans-serif;
  border: 2px solid var(--color-secundario);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.login-container .logo {
  width: 120px;
  margin-bottom: 1.2rem;
}
.login-container h2 {
  text-align: center;
  color: var(--color-secundario);
  font-family: 'Nunito', Arial, sans-serif;
  margin-bottom: 1.5rem;
}
.login-container form {
  width: 100%;
}
.login-container form > div {
  margin-bottom: 1rem;
}
.login-container label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--color-secundario);
  font-weight: 500;
}
.login-container input {
  width: 100%;
  padding: 0.5rem;
  border: 1.5px solid var(--color-principal);
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Nunito', Arial, sans-serif;
}
.login-container button {
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
.login-container button:hover {
  background: #e65c1b;
}
.login-container .error {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
}
.login-container .success {
  color: #388e3c;
  margin-top: 1rem;
  text-align: center;
}
.login-container .register-link {
  margin-top: 1.5rem;
  text-align: center;
}
.login-container .register-link a {
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}
  .login-title {
    color: #222;
    font-family: 'Nunito', Arial, sans-serif;
    font-size: 2rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 1.5rem;
  }
</style>
