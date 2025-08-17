<template>
  <div class="header-test">
    <img src="/UPQROO-logo.png" alt="UPQROO Logo" class="university-logo" />
    <h1>Test de Orientación Vocacional</h1>
    <p>Responde con "Sí" o "No" a cada pregunta según tu preferencia personal.</p>
  </div>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.header-test {
  text-align: center;
  background: white;
  border-radius: 15px;
  padding: 30px 20px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
  border-top: 5px solid #FF671F;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.university-logo {
  max-width: 300px;
  height: auto;
  margin-bottom: 20px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  text-align: center;
  color: #5B3427;
  margin-bottom: 10px;
  font-size: 2.2em;
  font-weight: 700;
}

.header-test p {
  color: #5B3427;
  font-size: 1.1em;
  margin: 0;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .header-test {
    padding: 20px 15px;
  }
  
  .university-logo {
    max-width: 250px;
  }
  
  h1 {
    font-size: 1.8em;
  }
}

@media (max-width: 480px) {
  .university-logo {
    max-width: 200px;
  }
  
  h1 {
    font-size: 1.6em;
  }
}
</style>
