<template>
<div class="usuario-card" :class="colorCarrera">
    <div class="card-header">
      <div class="usuario-info">
        <h3 class="usuario-nombre">{{ usuario.nombre }} {{ usuario.apellidos }}</h3>
        <p class="usuario-email">{{ usuario.email }}</p>
        <p class="usuario-curp">CURP: {{ usuario.curp }}</p>
      </div>
    </div>

    <div class="card-body">
      <div class="estadisticas">
        <div class="stat-item">
          <div class="stat-content">
            <span class="stat-label">Total Respuestas</span>
            <span class="stat-value">{{ resumen.total_respuestas }}</span>
          </div>
        </div>

        <div class="stat-item carrera-recomendada">
          <div class="stat-content">
            <span class="stat-label">Carrera Recomendada</span>
            <span class="stat-value">{{ nombreCarrera }}</span>
          </div>
        </div>
      </div>

      <div class="estado-test">
        <div class="estado-indicator" :class="estadoClase">
          <span class="estado-dot"></span>
          <span class="estado-texto">{{ estadoTexto }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <div class="acciones">
        <button class="btn-accion btn-resultados" @click="verResultados" :disabled="resumen.total_respuestas === 0">
          Ver Resultados
        </button>
        <button class="btn-accion btn-borrar" @click="borrarResultados" :disabled="resumen.total_respuestas === 0">
          Borrar Resultados
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatearNombreCarrera, obtenerIconoCarrera, obtenerColorCarrera } from '@/services/admin/adminService'

const props = defineProps({
  usuario: {
    type: Object,
    required: true
  },
  resumen: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['ver-detalles', 'ver-resultados', 'borrar-resultados'])

// Computed properties
const nombreCarrera = computed(() => formatearNombreCarrera(props.usuario.carrera_recomendada))
const iconoCarrera = computed(() => obtenerIconoCarrera(props.usuario.carrera_recomendada))
const colorCarrera = computed(() => obtenerColorCarrera(props.usuario.carrera_recomendada))

const estadoClase = computed(() => {
  if (props.resumen.total_respuestas === 0) return 'pendiente'
  if (props.resumen.total_respuestas > 0 && props.usuario.carrera_recomendada) return 'completado'
  return 'parcial'
})

const estadoTexto = computed(() => {
  if (props.resumen.total_respuestas === 0) return 'Test Pendiente'
  if (props.resumen.total_respuestas > 0 && props.usuario.carrera_recomendada) return 'Test Completado'
  return 'Test Parcial'
})

// Métodos
const verDetalles = () => {
  emit('ver-detalles', props.usuario)
}

const verResultados = () => {
  if (props.resumen.total_respuestas > 0) {
    emit('ver-resultados', props.usuario)
  }
}

const borrarResultados = () => {
  if (props.resumen.total_respuestas > 0) {
    emit('borrar-resultados', props.usuario)
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.usuario-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border-left: 4px solid #ddd;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.usuario-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Colores por carrera */
.usuario-card.salud {
  border-left-color: #FF671F;
}

.usuario-card.ingenieria {
  border-left-color: #5B3427;
}

.usuario-card.humanistica {
  border-left-color: #9b59b6;
}

.usuario-card.exactas {
  border-left-color: #f39c12;
}

.usuario-card.economica {
  border-left-color: #27ae60;
}

.usuario-card.defensa {
  border-left-color: #34495e;
}

.usuario-card.artistica {
  border-left-color: #e67e22;
}

.usuario-card.sin-carrera {
  border-left-color: #95a5a6;
}

/* Header de la tarjeta */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.usuario-info h3 {
  margin: 0 0 8px 0;
  color: #5B3427;
  font-size: 1.3rem;
  font-weight: 700;
}

.usuario-email {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 0.95rem;
}

.usuario-curp {
  margin: 0;
  color: #95a5a6;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}


/* Body de la tarjeta */
.estadisticas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 600;
}

.stat-value {
  font-size: 1.1rem;
  color: #5B3427;
  font-weight: 700;
}

/* Estado del test */
.estado-test {
  margin-bottom: 20px;
}

.estado-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.estado-indicator.completado {
  background: rgba(255, 103, 31, 0.1);
  color: #FF671F;
}

.estado-indicator.parcial {
  background: rgba(91, 52, 39, 0.1);
  color: #5B3427;
}

.estado-indicator.pendiente {
  background: #f8d7da;
  color: #721c24;
}

.estado-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

/* Footer de la tarjeta */
.acciones {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-accion {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-resultados {
  background: #FF671F;
  color: white;
}

.btn-resultados:hover:not(:disabled) {
  background: #e55a1a;
}

.btn-resultados:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-borrar {
  background: #5B3427;
  color: white;
}

.btn-borrar:hover:not(:disabled) {
  background: #4a2a1f;
}

.btn-borrar:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .usuario-card {
    padding: 15px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .usuario-id {
    align-self: flex-end;
  }
  
  .estadisticas {
    grid-template-columns: 1fr;
  }
  
  .acciones {
    grid-template-columns: 1fr;
  }
  
  .btn-accion {
    padding: 14px 16px;
  }
}
</style>
