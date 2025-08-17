<template>
  <div class="aspirante-home">
    <div class="welcome-section">
      <h2>Bienvenido al Portal de Aspirante</h2>
      <p>Aquí puedes realizar tu test vocacional y ver tus resultados.</p>
    </div>
    
    <div class="actions-section">
      <div class="action-card">
        <div class="card-icon">📝</div>
        <h3>Test de Orientación Vocacional</h3>
        <p>Realiza nuestro test completo para descubrir qué carreras se adaptan mejor a tus intereses y aptitudes.</p>
        <router-link to="/aspirante/test" class="btn-primary">
          Iniciar Test Vocacional
        </router-link>
      </div>
      
      <div class="action-card">
        <div class="card-icon">📊</div>
        <h3>Mis Resultados</h3>
        <p>Consulta los resultados de tu test vocacional y las recomendaciones de carreras.</p>
        <router-link to="/aspirante/resultados" class="btn-secondary">
          Ver Mis Resultados
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  // Verificar si el usuario está logueado
  const token = localStorage.getItem('token')
  const curp = localStorage.getItem('curp')
  
  if (!token || !curp) {
    router.push('/login')
  }
})
</script>

<style scoped>
.aspirante-home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.welcome-section {
  background: linear-gradient(135deg, #5B3427 0%, #FF671F 100%);
  color: white;
  text-align: center;
  padding: 40px 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  box-shadow: 0 10px 30px rgba(91, 52, 39, 0.3);
}

.welcome-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.welcome-section p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.actions-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.action-card {
  background: white;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(91, 52, 39, 0.1);
  transition: all 0.3s ease;
  border-top: 4px solid #FF671F;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(91, 52, 39, 0.15);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.action-card h3 {
  color: #5B3427;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.action-card p {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 25px;
}

.btn-primary {
  display: inline-block;
  background: linear-gradient(45deg, #FF671F, #ff8f47);
  color: white;
  text-decoration: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
  text-decoration: none;
  color: white;
}

.btn-secondary {
  background: linear-gradient(45deg, #5B3427, #7a4d3d);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(91, 52, 39, 0.3);
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(91, 52, 39, 0.4);
  text-decoration: none;
  color: white;
}

@media (max-width: 768px) {
  .aspirante-home {
    padding: 15px;
  }
  
  .welcome-section {
    padding: 30px 20px;
  }
  
  .welcome-section h2 {
    font-size: 2rem;
  }
  
  .welcome-section p {
    font-size: 1.1rem;
  }
  
  .action-card {
    padding: 25px 20px;
  }
  
  .actions-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .welcome-section h2 {
    font-size: 1.8rem;
  }
  
  .welcome-section p {
    font-size: 1rem;
  }
  
  .action-card h3 {
    font-size: 1.3rem;
  }
  
  .btn-primary,
  .btn-secondary {
    padding: 12px 25px;
    font-size: 14px;
  }
}
</style>
