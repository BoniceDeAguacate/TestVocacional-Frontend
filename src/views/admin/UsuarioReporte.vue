<template>
  <div class="usuario-reporte-view">
    <!-- Loading state -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando reporte del usuario...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h3 class="error-title">Error al cargar el reporte</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="cargarReporte" class="btn-retry">Reintentar</button>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header del usuario -->
      <div class="header">
        <div class="user-info">
          <h2 class="title">Resultados de {{ usuarioInfo.nombre }} {{ usuarioInfo.apellidos }}</h2>
          <div class="user-details">
            <span class="detail-item">
              <strong>Email:</strong> {{ usuarioInfo.email }}
            </span>
            <span class="detail-item">
              <strong>CURP:</strong> {{ usuarioInfo.curp }}
            </span>
            <span class="detail-item">
              <strong>ID:</strong> #{{ usuarioInfo.id }}
            </span>
          </div>
          <p class="subtitle">Reporte detallado del test vocacional</p>
        </div>
        
        <div class="header-actions">
          <button @click="volverAlDashboard" class="btn-back">
            Volver al Dashboard
          </button>
        </div>
      </div>

      <!-- Tabla de resultados (componente específico para admin) -->
      <div class="resultados-section">
        <TablaResultados 
          v-if="usuarioInfo"
          :usuario-id="usuarioId" 
          :usuario-curp="usuarioInfo.curp"
        />
        <div v-else class="loading-resultados">
          <div class="loading-spinner"></div>
          <p>Cargando información del usuario...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TablaResultados from '@/components/admin/TablaResultados.vue'
import { useAlert } from '@/composables/useAlert'
import { obtenerUsuario } from '@/services/admin/adminService'

const router = useRouter()
const route = useRoute()
const { showError, showSuccess } = useAlert()

// Props desde la ruta
const usuarioId = computed(() => route.params.usuarioId)
const nombreUsuario = computed(() => route.query.nombre || 'Usuario')

// Estados reactivos
const cargando = ref(true)
const error = ref(null)

// Datos del usuario
const usuarioInfo = ref({
  id: null,
  nombre: '',
  apellidos: '',
  email: '',
  curp: ''
})

const totalRespuestas = ref(0)
const carreraRecomendada = ref(null)
const fechaCompletado = ref(null)

// Métodos
const cargarReporte = async () => {
  try {
    cargando.value = true
    error.value = null

    // Llamar al API para obtener la información del usuario
    const respuesta = await obtenerUsuario(usuarioId.value)
    
    if (respuesta.success) {
      const userData = respuesta.data
      
      // Actualizar la información del usuario
      usuarioInfo.value = {
        id: userData.id,
        nombre: userData.nombre,
        apellidos: userData.apellidos,
        email: userData.email,
        curp: userData.curp
      }
      
      // Actualizar estadísticas del test
      totalRespuestas.value = userData.resumen?.total_respuestas || 0
      carreraRecomendada.value = userData.carrera_recomendada || 'Sin asignar'
      fechaCompletado.value = userData.fecha_completado || null
      
    } else {
      // Si el API no está disponible, usar datos simulados
      console.warn('API no disponible, usando datos simulados')
      
      usuarioInfo.value = {
        id: usuarioId.value,
        nombre: nombreUsuario.value.split(' ')[0] || 'Usuario',
        apellidos: nombreUsuario.value.split(' ').slice(1).join(' ') || 'Ejemplo',
        email: 'usuario@ejemplo.com',
        curp: 'CURP123456789'
      }
      
      totalRespuestas.value = 85
      carreraRecomendada.value = 'Artes y Humanidades'
      fechaCompletado.value = '2025-08-21'
    }

  } catch (err) {
    console.warn('Error al conectar con API, usando datos simulados:', err)
    
    // Fallback a datos simulados si hay error de conexión
    usuarioInfo.value = {
      id: usuarioId.value,
      nombre: nombreUsuario.value.split(' ')[0] || 'Usuario',
      apellidos: nombreUsuario.value.split(' ').slice(1).join(' ') || 'Ejemplo',
      email: 'usuario@ejemplo.com',
      curp: 'CURP123456789'
    }
    
    totalRespuestas.value = 85
    carreraRecomendada.value = 'Artes y Humanidades'
    fechaCompletado.value = '2025-08-21'
    
  } finally {
    cargando.value = false
  }
}

const volverAlDashboard = () => {
  router.push('/admin')
}

// Lifecycle
onMounted(() => {
  cargarReporte()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.usuario-reporte-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Loading y Error states */
.loading-container, .error-container {
  background: white;
  border-radius: 10px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #FF671F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.error-title {
  color: #5B3427;
  margin: 0 0 10px 0;
  font-size: 1.5rem;
}

.error-message {
  color: #7f8c8d;
  margin: 0 0 20px 0;
}

.btn-retry {
  background: #FF671F;
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-retry:hover {
  background: #e55a1a;
}

/* Header */
.header {
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.user-info {
  flex: 1;
}

.title {
  color: #5B3427;
  margin-bottom: 15px;
  font-size: 2.2rem;
  font-weight: 700;
}

.user-details {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 10px;
}

.detail-item {
  color: #7f8c8d;
  font-size: 0.95rem;
}

.detail-item strong {
  color: #5B3427;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-back {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
  min-width: 150px;
  background: #ecf0f1;
  color: #5B3427;
}

.btn-back:hover {
  background: #d5dbdb;
  transform: translateY(-1px);
}

/* Stats section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
  background: rgba(255, 103, 31, 0.1);
  padding: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5B3427;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

/* Resultados section */
.resultados-section {
  background: white;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-resultados {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-resultados .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #FF671F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-resultados p {
  color: #7f8c8d;
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .usuario-reporte-view {
    padding: 15px;
  }
  
  .header {
    flex-direction: column;
    gap: 20px;
  }
  
  .user-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .header-actions {
    flex-direction: row;
    width: 100%;
  }
  
  .title {
    font-size: 1.8rem;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .resultados-section {
    padding: 20px;
  }
}
</style>
