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
        <button @click="openTestModal" class="btn-primary">
          Iniciar Test Vocacional
        </button>
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
    
    <!-- Modal de Instrucciones del Test -->
    <div v-if="showTestModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="instruction-icon">📝</div>
          <h3>Instrucciones del Test Vocacional</h3>
        </div>
        <div class="modal-body">
          <p class="instruction-text">
            Por favor responde con sinceridad, qué tanto te gustaría realizar cada una de las siguientes actividades.
          </p>
          <p class="instruction-detail">
            Solamente podrás seleccionar una. Te pedimos que si se trata de una actividad que nunca has realizado, trates de imaginar si te gustaría o no, comparándola con una similar que ya hayas llevado a cabo.
          </p>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button @click="startTest" class="btn-start-test">
            Entendido, Iniciar Test
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showTestModal = ref(false)

onMounted(() => {
  // Verificar si el usuario está logueado
  const token = localStorage.getItem('token')
  const curp = localStorage.getItem('curp')
  
  if (!token || !curp) {
    router.push('/login')
  }
})

// Funciones del modal
const openTestModal = () => {
  showTestModal.value = true
}

const closeModal = () => {
  showTestModal.value = false
}

const startTest = () => {
  showTestModal.value = false
  router.push('/aspirante/test')
}
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

/* Estilos para el modal de instrucciones */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(91, 52, 39, 0.2);
  max-width: 500px;
  width: 90%;
  margin: 20px;
  border-top: 4px solid #FF671F;
}

.modal-header {
  text-align: center;
  padding: 30px 30px 20px 30px;
  border-bottom: 1px solid #f0f0f0;
}

.instruction-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF671F 0%, #ff8f47 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
}

.modal-header h3 {
  color: #5B3427;
  margin: 0;
  font-weight: 700;
  font-size: 1.6rem;
  font-family: 'Nunito', Arial, sans-serif;
}

.modal-body {
  padding: 25px 30px;
}

.instruction-text {
  color: #5B3427;
  margin-bottom: 20px;
  line-height: 1.6;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
}

.instruction-detail {
  color: #666;
  margin: 0;
  line-height: 1.6;
  font-size: 1rem;
  text-align: justify;
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border-left: 4px solid #FF671F;
}

.modal-footer {
  padding: 20px 30px 30px 30px;
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-cancel {
  background: transparent;
  color: #5B3427;
  border: 2px solid #5B3427;
  padding: 12px 25px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', Arial, sans-serif;
}

.btn-cancel:hover {
  background: #5B3427;
  color: white;
  transform: translateY(-2px);
}

.btn-start-test {
  background: linear-gradient(45deg, #FF671F, #ff8f47);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
  font-family: 'Nunito', Arial, sans-serif;
}

.btn-start-test:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
}

/* Responsive para el modal */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header {
    padding: 25px 20px 15px 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-footer {
    padding: 15px 20px 25px 20px;
    flex-direction: column;
  }
  
  .instruction-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .modal-header h3 {
    font-size: 1.4rem;
  }
  
  .instruction-text {
    font-size: 1rem;
  }
  
  .instruction-detail {
    padding: 15px;
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .modal-header h3 {
    font-size: 1.3rem;
  }
  
  .instruction-text {
    font-size: 0.95rem;
  }
  
  .btn-cancel,
  .btn-start-test {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
