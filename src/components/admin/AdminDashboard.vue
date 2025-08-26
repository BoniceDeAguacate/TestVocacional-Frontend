<template>
  <div class="admin-dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <h1 class="dashboard-title">Dashboard de Administración</h1>
      <p class="dashboard-subtitle">Gestión de usuarios y resultados del test vocacional</p>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalUsuarios }}</div>
          <div class="stat-label">Total Usuarios</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ usuariosCompletados }}</div>
          <div class="stat-label">Tests Completados</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ usuariosPendientes }}</div>
          <div class="stat-label">Tests Pendientes</div>
        </div>
      </div>
    </div>

    <!-- Filtros y Búsqueda -->
    <div class="filters-section" v-if="!cargando">
      <div class="search-filters">
        <div class="search-box">
          <input 
            v-model="filtros.busqueda"
            type="text" 
            placeholder="Buscar por nombre, email o CURP..."
            class="search-input"
          >
        </div>
        
        <select v-model="filtros.estado" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="completado">Tests Completados</option>
          <option value="pendiente">Tests Pendientes</option>
          <option value="parcial">Tests Parciales</option>
        </select>
        
        <select v-model="filtros.carrera" class="filter-select">
          <option value="">Todas las carreras</option>
          <option value="salud">Área de Salud</option>
          <option value="ingenieria">Ingeniería y Tecnología</option>
          <option value="humanistica">Humanística y Educación</option>
          <option value="exactas">Ciencias Exactas</option>
          <option value="economica">Económico Administrativa</option>
          <option value="defensa">Defensa y Seguridad</option>
          <option value="artistica">Artística</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <h3 class="error-title">Error al cargar el dashboard</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="cargarDashboard" class="btn-retry">
        Reintentar
      </button>
    </div>

    <!-- Grid de Usuarios -->
    <div v-else class="usuarios-section">
      <div v-if="usuariosFiltrados.length === 0" class="empty-state">
        <h3 class="empty-title">No se encontraron usuarios</h3>
        <p class="empty-message">
          {{ filtros.busqueda || filtros.estado || filtros.carrera 
             ? 'Intenta ajustar los filtros de búsqueda' 
             : 'Aún no hay usuarios registrados en el sistema' }}
        </p>
      </div>
      
      <div v-else class="usuarios-grid">
        <UsuarioCard
          v-for="usuario in usuariosFiltrados"
          :key="usuario.id"
          :usuario="usuario"
          :resumen="usuario.resumen"
          @ver-detalles="verDetallesUsuario"
          @ver-resultados="verResultadosUsuario"
          @borrar-resultados="borrarResultadosUsuario"
        />
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="!cargando && !error && totalPaginas > 1" class="pagination">
      <button 
        @click="cambiarPagina(paginaActual - 1)"
        :disabled="paginaActual === 1"
        class="btn-pagination"
      >
        ← Anterior
      </button>
      
      <div class="pagination-info">
        <span>Página {{ paginaActual }} de {{ totalPaginas }}</span>
        <span class="total-items">({{ totalUsuarios }} usuarios total)</span>
      </div>
      
      <button 
        @click="cambiarPagina(paginaActual + 1)"
        :disabled="paginaActual === totalPaginas"
        class="btn-pagination"
      >
        Siguiente →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import UsuarioCard from '@/components/admin/UsuarioCard.vue'
import { obtenerDashboardAdmin, borrarResultadosUsuario as borrarResultadosApi } from '@/services/admin/adminService'
import { useAlert } from '@/composables/useAlert'

// Composables
const router = useRouter()
const { showError, showSuccess, showConfirm } = useAlert()

// Estado reactivo
const cargando = ref(false)
const error = ref(null)
const usuarios = ref([])
const paginaActual = ref(1)
const totalPaginas = ref(1)
const totalUsuarios = ref(0)

// Filtros
const filtros = ref({
  busqueda: '',
  estado: '',
  carrera: ''
})

// Computed properties
const usuariosCompletados = computed(() => {
  return usuarios.value.filter(u => 
    u.resumen.total_respuestas > 0 && u.carrera_recomendada
  ).length
})

const usuariosPendientes = computed(() => {
  return usuarios.value.filter(u => u.resumen.total_respuestas === 0).length
})

const usuariosFiltrados = computed(() => {
  let resultado = usuarios.value

  // Filtro por búsqueda
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(usuario => {
      return usuario.nombre.toLowerCase().includes(busqueda) ||
             usuario.apellidos.toLowerCase().includes(busqueda) ||
             usuario.email.toLowerCase().includes(busqueda) ||
             usuario.curp.toLowerCase().includes(busqueda)
    })
  }

  // Filtro por estado
  if (filtros.value.estado) {
    resultado = resultado.filter(usuario => {
      const estado = getEstadoUsuario(usuario)
      return estado === filtros.value.estado
    })
  }

  // Filtro por carrera
  if (filtros.value.carrera) {
    resultado = resultado.filter(usuario => {
      if (!usuario.carrera_recomendada) return filtros.value.carrera === 'sin-carrera'
      return usuario.carrera_recomendada.toLowerCase().includes(filtros.value.carrera)
    })
  }

  return resultado
})

// Métodos
const getEstadoUsuario = (usuario) => {
  if (usuario.resumen.total_respuestas === 0) return 'pendiente'
  if (usuario.resumen.total_respuestas > 0 && usuario.carrera_recomendada) return 'completado'
  return 'parcial'
}

const cargarDashboard = async (pagina = 1) => {
  try {
    cargando.value = true
    error.value = null

    const response = await obtenerDashboardAdmin(pagina)
    
    // Verificar que la respuesta sea exitosa
    if (response.success && response.data) {
      const apiData = response.data
      
      // Procesar los datos para aplanar la estructura
      const usuariosProcesados = apiData.items.map(item => ({
        id: item.usuario.id,
        curp: item.usuario.curp,
        nombre: item.usuario.nombre,
        apellidos: item.usuario.apellidos,
        email: item.usuario.email,
        resumen: {
          total_respuestas: item.resumen.total_respuestas
        },
        carrera_recomendada: item.carrera_recomendada
      }))
      
      usuarios.value = usuariosProcesados
      paginaActual.value = apiData.page
      totalPaginas.value = apiData.totalPages
      totalUsuarios.value = apiData.total
    } else {
      throw new Error(response.message || 'Error al cargar dashboard')
    }

  } catch (err) {
    console.error('Error al cargar dashboard:', err)
    error.value = err.response?.data?.message || err.message || 'Error de conexión con el servidor'
    showError('Error al cargar dashboard', error.value)
  } finally {
    cargando.value = false
  }
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
    cargarDashboard(nuevaPagina)
  }
}

const verDetallesUsuario = (usuario) => {
  showSuccess('Función en desarrollo', `Mostrando detalles de ${usuario.nombre}`)
  // TODO: Implementar modal o vista de detalles del usuario
}

const verResultadosUsuario = (usuario) => {
  if (usuario.resumen.total_respuestas > 0) {
    // Navegar a la vista de resultados del usuario específico
    router.push({
      name: 'UsuarioReporte',
      params: { usuarioId: usuario.id },
      query: { nombre: `${usuario.nombre} ${usuario.apellidos}` }
    })
  }
}

const borrarResultadosUsuario = async (usuario) => {
  // Confirmar eliminación con SweetAlert
  const resultado = await showConfirm(
    `¿Estás seguro de que deseas eliminar todos los resultados del test de "${usuario.nombre} ${usuario.apellidos}"?\n\nEsta acción no se puede deshacer.`,
    'Confirmar eliminación de resultados'
  )
  
  if (!resultado.isConfirmed) {
    return
  }
  
  try {
    const respuesta = await borrarResultadosApi(usuario.curp)
    
    if (respuesta.success) {
      // Actualizar el estado local del usuario
      const indiceUsuario = usuarios.value.findIndex(u => u.id === usuario.id)
      if (indiceUsuario !== -1) {
        usuarios.value[indiceUsuario].resumen.total_respuestas = 0
        usuarios.value[indiceUsuario].carrera_recomendada = null
      }
      
      await showSuccess('Resultados eliminados exitosamente', 'Resultados eliminados')
      
      // Recargar el dashboard para obtener datos actualizados
      await cargarDashboard(paginaActual.value)
    } else {
      await showError(respuesta.message, 'Error al eliminar resultados')
    }
  } catch (error) {
    console.error('Error al eliminar resultados:', error)
    await showError('Error inesperado al eliminar los resultados', 'Error del sistema')
  }
}

// Watchers para limpiar filtros cuando cambian
watch(
  [() => filtros.value.busqueda, () => filtros.value.estado, () => filtros.value.carrera],
  () => {
    // Resetear a la primera página cuando cambian los filtros
    if (paginaActual.value !== 1) {
      paginaActual.value = 1
    }
  }
)

// Lifecycle
onMounted(() => {
  cargarDashboard()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header del Dashboard */
.dashboard-header {
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.dashboard-title {
  font-size: 2.2rem;
  color: #5B3427;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.dashboard-subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0 0 30px 0;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease;
  border-bottom: 4px solid #FF671F;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #FF671F;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 600;
}

/* Filtros */
.filters-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  align-items: center;
}

.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Nunito', inherit;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FF671F;
}

.filter-select {
  padding: 12px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Nunito', inherit;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #FF671F;
}

/* Estados de carga y error */
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

/* Sección de usuarios */
.usuarios-section {
  margin-bottom: 20px;
}

.empty-state {
  background: white;
  border-radius: 10px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-title {
  color: #5B3427;
  margin: 0 0 10px 0;
  font-size: 1.8rem;
}

.empty-message {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1rem;
}

.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

/* Paginación */
.pagination {
  background: white;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.btn-pagination {
  background: #FF671F;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-pagination:hover:not(:disabled) {
  background: #e55a1a;
  transform: translateY(-1px);
}

.btn-pagination:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.pagination-info {
  text-align: center;
  color: #5B3427;
  font-weight: 600;
}

.total-items {
  display: block;
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 10px;
  }
  
  .dashboard-header {
    padding: 20px;
  }
  
  .dashboard-title {
    font-size: 1.8rem;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .search-filters {
    grid-template-columns: 1fr;
  }
  
  .usuarios-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
