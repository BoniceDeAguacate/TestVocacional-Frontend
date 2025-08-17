<template>
  <header class="nav-header admin-navbar">
    <div class="nav-container">
      <div class="logo">
        <img src="/UPQROO-logo.png" alt="UPQROO" class="logo-img">
        <span class="logo-text">Panel Admin - UPQROO</span>
      </div>
      <nav class="nav-menu">
        <router-link 
          to="/admin/dashboard" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/dashboard') }"
        >
          📊 Dashboard
        </router-link>
        <router-link 
          to="/admin/users" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/users') }"
        >
          👥 Usuarios
        </router-link>
        <router-link 
          to="/admin/tests" 
          class="nav-btn"
          :class="{ active: $route.path.includes('/admin/tests') }"
        >
          📋 Tests
        </router-link>
        <button @click="cerrarSesion" class="nav-btn logout">
          🚪 Cerrar Sesión
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
/* Navigation Header */
.nav-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-navbar {
  border-bottom: 3px solid #e74c3c;
}

.nav-container {
  max-width: 1400px;
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
}

.logo-img {
  height: 45px;
  width: auto;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #e74c3c;
  font-family: 'Nunito', Arial, sans-serif;
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
  background: #e74c3c;
  color: white;
}

.nav-btn.logout {
  background: #34495e;
  color: white;
}

.nav-btn.logout:hover {
  background: #2c3e50;
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
