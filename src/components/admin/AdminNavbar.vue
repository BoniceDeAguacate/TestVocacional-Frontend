<template>
  <header class="nav-header">
    <div class="nav-container">
      <router-link to="/admin" class="logo">
        <img src="/UPQROO-logo.png" alt="UPQROO" class="logo-img">
        <span class="logo-text">Panel Administración</span>
      </router-link>
      <nav class="nav-menu">
        <router-link 
          to="/admin" 
          class="nav-btn"
          :class="{ active: $route.path === '/admin' }"
        >
          Dashboard
        </router-link>
        
        <router-link 
          to="/admin/usuarios" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/usuarios') }"
        >
          Usuarios
        </router-link>
        
        <router-link 
          to="/admin/reportes" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/reportes') }"
        >
          Reportes
        </router-link>
        
        <router-link 
          to="/admin/configuracion" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/configuracion') }"
        >
          Configuración
        </router-link>
        
        <button @click="cerrarSesion" class="nav-btn logout">
          Cerrar Sesión
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { logout } from '@/services/authService'
import { useAlert } from '@/composables/useAlert'

const router = useRouter()
const { showSuccess } = useAlert()

const cerrarSesion = async () => {
  // Usar el servicio de logout
  logout()
  
  // Mostrar alerta de confirmación
  await showSuccess('Has cerrado sesión correctamente', '¡Hasta pronto!')
  
  // Redirigir al login
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

/* Navigation Header */
.nav-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

.logo:hover {
  background: rgba(255, 103, 31, 0.1);
  transform: translateY(-1px);
}

.logo:active {
  transform: translateY(0);
}

.logo-img {
  height: 45px;
  width: auto;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Nunito', Arial, sans-serif;
  transition: color 0.3s ease;
}

.logo:hover .logo-text {
  color: #FF671F;
}

.nav-menu {
  display: flex;
  gap: 15px;
  align-items: center;
}

.nav-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background: #ecf0f1;
  color: #2c3e50;
  text-decoration: none;
  display: inline-block;
  font-family: 'Nunito', Arial, sans-serif;
}

.nav-btn:hover {
  background: #d5dbdb;
  transform: translateY(-2px);
}

.nav-btn.active {
  background: #FF671F;
  color: white;
}

.nav-btn.logout {
  background: #5B3427;
  color: white;
}

.nav-btn.logout:hover {
  background: #4a2a1f;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
  
  .logo {
    justify-content: center;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .logo-text {
    font-size: 1.1rem;
  }
  
  .nav-btn {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .logo {
    flex-direction: column;
    gap: 8px;
  }
  
  .logo-img {
    height: 35px;
  }
}
</style>
