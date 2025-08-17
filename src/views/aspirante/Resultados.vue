<template>
  <div class="resultados-view">
    <div class="header">
      <h2 class="title">Resultados del Test Vocacional</h2>
      <p class="subtitle">Aquí puedes ver tus resultados organizados por materia</p>
    </div>
    
    <TablaResultados />
  </div>
</template>

<script setup>
import TablaResultados from '@/components/aspirante/TablaResultados.vue'
</script>

<style scoped>
.resultados-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .resultados-view {
    padding: 15px;
  }
  
  .title {
    font-size: 2rem;
  }
}
</style>
