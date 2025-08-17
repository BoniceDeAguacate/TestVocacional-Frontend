<template>
  <div class="main-layout">
    <div class="flex flex-col min-h-screen">
      <!-- Navbar dinámico según el layout -->
      <component :is="NavbarComponent" />
      
      <!-- Contenido principal -->
      <main class="flex-1">
        <div id="content-slot" class="mx-auto w-full max-w-[1400px] px-4 md:px-8 py-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AspiranteNavbar from '@/components/aspirante/AspiranteNavbar.vue'
import AdminNavbar from '@/components/admin/AdminNavbar.vue'

const route = useRoute()

// Componente navbar dinámico según la ruta
const NavbarComponent = computed(() => {
  const layout = route.meta.layout
  
  switch (layout) {
    case 'aspirante':
      return AspiranteNavbar
    case 'admin':
      return AdminNavbar
    default:
      return AspiranteNavbar // Valor por defecto
  }
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  width: 100%;
}

/* Estilos para el contenido sin navbar */
.main-layout .flex {
  width: 100%;
}

/* Estilos para el contenido principal */
main {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Responsive */
@media (max-width: 768px) {
  #content-slot {
    padding: 1rem;
  }
}
</style>
