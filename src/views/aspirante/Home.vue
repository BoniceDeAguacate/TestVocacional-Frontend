<template>
  <div class="aspirante-home">
    <!-- Navigation Header -->
    <header class="nav-header">
      <div class="nav-container">
        <div class="logo">
          <img src="/UPQROO-logo.png" alt="UPQROO" class="logo-img">
          <span class="logo-text">Test Vocacional UPQROO</span>
        </div>
        <nav class="nav-menu">
          <button 
            @click="vistaActual = 'resultados'" 
            :class="{ active: vistaActual === 'resultados' }"
            class="nav-btn"
          >
            📊 Mis Resultados
          </button>
          <button @click="cerrarSesion" class="nav-btn logout">
            🚪 Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Resultados View -->
      <div v-if="vistaActual === 'resultados'" class="view-container">
        <ResultadosAspirante />
      </div>

      <!-- Otras vistas futuras pueden ir aquí -->
    </main>
  </div>
</template>

<script>
import ResultadosAspirante from '../../components/aspirante/ResultadosAspirante.vue';
import { logout } from '../../services/authService';

export default {
  name: 'AspiranteHome',
  components: {
    ResultadosAspirante
  },
  data() {
    return {
      vistaActual: 'resultados'
    };
  },
  methods: {
    cerrarSesion() {
      // Usar el servicio de logout
      logout();
      
      // Redirigir al login
      this.$router.push('/login');
    }
  },
  mounted() {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('token');
    const curp = localStorage.getItem('curp');
    
    if (!token || !curp) {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.aspirante-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

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
}

.logo-img {
  height: 45px;
  width: auto;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
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
}

.nav-btn:hover {
  background: #d5dbdb;
  transform: translateY(-2px);
}

.nav-btn.active {
  background: #3498db;
  color: white;
}

.nav-btn.logout {
  background: #e74c3c;
  color: white;
}

.nav-btn.logout:hover {
  background: #c0392b;
}

/* Main Content */
.main-content {
  padding: 30px 0;
}

.view-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
