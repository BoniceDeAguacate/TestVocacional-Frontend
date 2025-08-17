<template>
  <div class="test-vocacional-view">
    <HeaderTest />
    <FormularioTest />
  </div>
</template>

<script setup>
import HeaderTest from '@/components/aspirante/HeaderTest.vue'
import FormularioTest from '@/components/aspirante/FormularioTest.vue'
</script>

<style scoped>
.test-vocacional-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
}

@media (max-width: 768px) {
  .test-vocacional-view {
    padding: 15px;
  }
}
</style>
