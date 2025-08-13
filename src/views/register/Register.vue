

<template>
  <div class="register-container">
    <RegisterForm />
  </div>
</template>

<script setup>
import RegisterForm from '@/components/register/RegisterForm.vue'
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap');
/* Colores institucionales */
:root {
  --color-principal: #FF671F;
  --color-secundario: #5B3427;
}

.register-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 2rem;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(91,52,39,0.08);
  border: 2px solid var(--color-secundario);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.register-container .logo {
  width: 120px;
  margin-bottom: 1.2rem;
}
.register-container h2 {
  text-align: center;
  color: var(--color-secundario);
  font-family: 'Nunito', Arial, sans-serif;
  margin-bottom: 1.5rem;
}
.register-container form {
  width: 100%;
}
.register-container form > div {
  margin-bottom: 1rem;
}
.register-container label {
  display: block;
  margin-bottom: 0.3rem;
  color: var(--color-secundario);
  font-weight: 500;
}
.register-container input {
  width: 100%;
  padding: 0.5rem;
  border: 1.5px solid var(--color-principal);
  border-radius: 4px;
  font-size: 1rem;
  font-family: 'Nunito', Arial, sans-serif;
}
.register-container button {
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
.register-container button:hover {
  background: #e65c1b;
}
.register-container .error {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
}
.register-container .success {
  color: #388e3c;
  margin-top: 1rem;
  text-align: center;
}
.register-container .login-link {
  margin-top: 1.5rem;
  text-align: center;
}
.register-container .login-link a {
  color: var(--color-principal);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 500;
}
</style>
