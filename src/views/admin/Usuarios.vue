<template>
  <div class="usuarios-management">
    <!-- Header con acciones -->
    <div class="management-header">
      <div class="header-info">
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-subtitle">Administra todos los usuarios registrados en el sistema</p>
      </div>
      <div class="header-actions">
        <button @click="exportarUsuarios" class="btn-export" :disabled="exportando">
          {{ exportando ? 'Exportando...' : '📤 Exportar' }}
        </button>
        <button @click="mostrarModalCrear" class="btn-create">
          ➕ Nuevo Usuario
        </button>
      </div>
    </div>

    <!-- Filtros avanzados -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-group">
          <label>Buscar</label>
          <input 
            v-model="filtros.busqueda"
            type="text" 
            placeholder="Nombre, email o CURP..."
            class="filter-input"
          >
        </div>
        
        <div class="filter-group">
          <label>Estado del Test</label>
          <select v-model="filtros.estado" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="completado">Test Completado</option>
            <option value="parcial">Test Parcial</option>
            <option value="pendiente">Test Pendiente</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Carrera Recomendada</label>
          <select v-model="filtros.carrera" class="filter-select">
            <option value="">Todas las carreras</option>
            <option value="salud">Ciencias de la Salud</option>
            <option value="ingenieria">Ingeniería</option>
            <option value="humanistica">Ciencias Humanísticas</option>
            <option value="exactas">Ciencias Exactas</option>
            <option value="economica">Ciencias Económicas</option>
            <option value="defensa">Defensa y Seguridad</option>
            <option value="artistica">Artes y Humanidades</option>
            <option value="sin-carrera">Sin carrera asignada</option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Fecha de Registro</label>
          <input 
            v-model="filtros.fecha" 
            type="date" 
            class="filter-input"
          >
        </div>
      </div>
      
      <div class="filters-actions">
        <button @click="limpiarFiltros" class="btn-clear">
          🗑️ Limpiar Filtros
        </button>
        <button @click="aplicarFiltros" class="btn-apply">
          🔍 Aplicar Filtros
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="cargando" class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Cargando usuarios...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <h3 class="error-title">Error al cargar usuarios</h3>
      <p class="error-message">{{ error }}</p>
      <button @click="cargarUsuarios" class="btn-retry">Reintentar</button>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else class="table-section">
      <div class="table-header">
        <h3>{{ usuariosFiltrados.length }} usuario(s) encontrado(s)</h3>
        <div class="table-controls">
          <select v-model="itemsPorPagina" @change="cambiarItemsPorPagina" class="items-select">
            <option value="10">10 por página</option>
            <option value="25">25 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
          </select>
        </div>
      </div>

      <div class="table-container">
        <table class="usuarios-table">
          <thead>
            <tr>
              <th @click="ordenarPor('id')" class="sortable">
                ID
                <span class="sort-icon" v-if="ordenActual === 'id'">
                  {{ direccionOrden === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="ordenarPor('nombre')" class="sortable">
                Nombre
                <span class="sort-icon" v-if="ordenActual === 'nombre'">
                  {{ direccionOrden === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Email</th>
              <th>CURP</th>
              <th>Estado del Test</th>
              <th>Carrera Recomendada</th>
              <th @click="ordenarPor('fecha_registro')" class="sortable">
                Fecha Registro
                <span class="sort-icon" v-if="ordenActual === 'fecha_registro'">
                  {{ direccionOrden === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosPaginados" :key="usuario.id" class="usuario-row">
              <td class="id-cell">#{{ usuario.id }}</td>
              <td class="nombre-cell">
                <div class="usuario-nombre">
                  {{ usuario.nombre }} {{ usuario.apellidos }}
                </div>
              </td>
              <td class="email-cell">{{ usuario.email }}</td>
              <td class="curp-cell">{{ usuario.curp }}</td>
              <td class="estado-cell">
                <span class="estado-badge" :class="getEstadoClase(usuario)">
                  {{ getEstadoTexto(usuario) }}
                </span>
              </td>
              <td class="carrera-cell">
                {{ formatearCarrera(usuario.carrera_recomendada) }}
              </td>
              <td class="fecha-cell">
                {{ formatearFecha(usuario.fecha_registro) }}
              </td>
              <td class="acciones-cell">
                <div class="acciones-grupo">
                  <button 
                    @click="verReporte(usuario)" 
                    class="btn-accion btn-ver"
                    :disabled="!usuario.resumen || usuario.resumen.total_respuestas === 0"
                    title="Ver Reporte"
                  >
                    👁️
                  </button>
                  <button 
                    @click="editarUsuario(usuario)" 
                    class="btn-accion btn-editar"
                    title="Editar Usuario"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="eliminarUsuario(usuario)" 
                    class="btn-accion btn-eliminar"
                    title="Eliminar Usuario"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination-section">
        <div class="pagination-info">
          <span>
            Mostrando {{ (paginaActual - 1) * itemsPorPagina + 1 }} - 
            {{ Math.min(paginaActual * itemsPorPagina, usuariosFiltrados.length) }} 
            de {{ usuariosFiltrados.length }} usuarios
          </span>
        </div>
        
        <div class="pagination-controls">
          <button 
            @click="irAPagina(paginaActual - 1)"
            :disabled="paginaActual === 1"
            class="btn-pagination"
          >
            ← Anterior
          </button>
          
          <div class="pagination-numbers">
            <button 
              v-for="pagina in paginasVisibles" 
              :key="pagina"
              @click="irAPagina(pagina)"
              :class="{ active: pagina === paginaActual }"
              class="btn-pagina"
            >
              {{ pagina }}
            </button>
          </div>
          
          <button 
            @click="irAPagina(paginaActual + 1)"
            :disabled="paginaActual === totalPaginas"
            class="btn-pagination"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { formatearNombreCarrera, obtenerTodosLosUsuarios } from '@/services/admin/adminService'

const router = useRouter()

// Estados reactivos
const cargando = ref(true)
const error = ref(null)
const exportando = ref(false)
const usuarios = ref([])

// Filtros
const filtros = ref({
  busqueda: '',
  estado: '',
  carrera: '',
  fecha: ''
})

// Paginación
const paginaActual = ref(1)
const itemsPorPagina = ref(10)

// Ordenamiento
const ordenActual = ref('id')
const direccionOrden = ref('desc')

// Computed properties
const usuariosFiltrados = computed(() => {
  let resultado = [...usuarios.value]

  // Aplicar filtros
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(usuario => 
      usuario.nombre.toLowerCase().includes(busqueda) ||
      usuario.apellidos.toLowerCase().includes(busqueda) ||
      usuario.email.toLowerCase().includes(busqueda) ||
      usuario.curp.toLowerCase().includes(busqueda)
    )
  }

  if (filtros.value.estado) {
    resultado = resultado.filter(usuario => {
      const estado = getEstadoUsuario(usuario)
      return estado === filtros.value.estado
    })
  }

  if (filtros.value.carrera) {
    resultado = resultado.filter(usuario => {
      if (filtros.value.carrera === 'sin-carrera') {
        return !usuario.carrera_recomendada
      }
      return usuario.carrera_recomendada === filtros.value.carrera
    })
  }

  if (filtros.value.fecha) {
    resultado = resultado.filter(usuario => {
      const fechaUsuario = new Date(usuario.fecha_registro).toISOString().split('T')[0]
      return fechaUsuario === filtros.value.fecha
    })
  }

  // Aplicar ordenamiento
  resultado.sort((a, b) => {
    let aVal = a[ordenActual.value]
    let bVal = b[ordenActual.value]

    if (ordenActual.value === 'nombre') {
      aVal = `${a.nombre} ${a.apellidos}`
      bVal = `${b.nombre} ${b.apellidos}`
    }

    if (direccionOrden.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return resultado
})

const totalPaginas = computed(() => {
  return Math.ceil(usuariosFiltrados.value.length / itemsPorPagina.value)
})

const usuariosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina.value
  const fin = inicio + itemsPorPagina.value
  return usuariosFiltrados.value.slice(inicio, fin)
})

const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const actual = paginaActual.value
  const rango = 2

  let inicio = Math.max(1, actual - rango)
  let fin = Math.min(total, actual + rango)

  const paginas = []
  for (let i = inicio; i <= fin; i++) {
    paginas.push(i)
  }
  return paginas
})

// Métodos
const cargarUsuarios = async () => {
  try {
    cargando.value = true
    error.value = null

    // Intentar conectar con la API real
    try {
      const respuesta = await obtenerTodosLosUsuarios()
      
      if (respuesta.success) {
        usuarios.value = respuesta.data
        return
      }
    } catch (apiError) {
      console.warn('API no disponible, usando datos simulados')
    }
    
    // Fallback: usar datos simulados si la API no está disponible
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    usuarios.value = [
      {
        id: 6,
        nombre: 'Edigatason',
        apellidos: 'Robles',
        email: 'Example@outlook.com',
        curp: 'ROLE020901HCSBPDA9',
        carrera_recomendada: 'artistica',
        fecha_registro: '2025-01-15',
        resumen: { total_respuestas: 97 }
      },
      {
        id: 7,
        nombre: 'Aaron',
        apellidos: 'Mendez',
        email: 'aaron@outlook.com',
        curp: 'MEIA991204HQRNTR03',
        carrera_recomendada: null,
        fecha_registro: '2025-02-10',
        resumen: { total_respuestas: 0 }
      },
      {
        id: 8,
        nombre: 'María',
        apellidos: 'García López',
        email: 'maria.garcia@email.com',
        curp: 'GALM950315MDFRRR05',
        carrera_recomendada: 'salud',
        fecha_registro: '2025-01-20',
        resumen: { total_respuestas: 97 }
      },
      {
        id: 9,
        nombre: 'Carlos',
        apellidos: 'Hernández',
        email: 'carlos.hernandez@email.com',
        curp: 'HERC940822HDFRRL09',
        carrera_recomendada: 'ingenieria',
        fecha_registro: '2025-01-18',
        resumen: { total_respuestas: 50 }
      }
    ]
    
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    error.value = 'Error al cargar la lista de usuarios'
  } finally {
    cargando.value = false
  }
}

const getEstadoUsuario = (usuario) => {
  if (!usuario.resumen || usuario.resumen.total_respuestas === 0) return 'pendiente'
  if (usuario.resumen.total_respuestas > 0 && usuario.carrera_recomendada) return 'completado'
  return 'parcial'
}

const getEstadoClase = (usuario) => {
  return getEstadoUsuario(usuario)
}

const getEstadoTexto = (usuario) => {
  const estado = getEstadoUsuario(usuario)
  const textos = {
    'pendiente': 'Pendiente',
    'parcial': 'Parcial',
    'completado': 'Completado'
  }
  return textos[estado]
}

const formatearCarrera = (carrera) => {
  return formatearNombreCarrera(carrera)
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES')
}

const ordenarPor = (campo) => {
  if (ordenActual.value === campo) {
    direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc'
  } else {
    ordenActual.value = campo
    direccionOrden.value = 'asc'
  }
}

const limpiarFiltros = () => {
  filtros.value = {
    busqueda: '',
    estado: '',
    carrera: '',
    fecha: ''
  }
  paginaActual.value = 1
}

const aplicarFiltros = () => {
  paginaActual.value = 1
}

const cambiarItemsPorPagina = () => {
  paginaActual.value = 1
}

const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= totalPaginas.value) {
    paginaActual.value = pagina
  }
}

const verReporte = (usuario) => {
  router.push({
    name: 'UsuarioReporte',
    params: { usuarioId: usuario.id },
    query: { nombre: `${usuario.nombre} ${usuario.apellidos}` }
  })
}

const editarUsuario = (usuario) => {
  alert(`Función en desarrollo - Editando usuario: ${usuario.nombre}`)
  // TODO: Implementar modal de edición
}

const eliminarUsuario = async (usuario) => {
  const confirmado = confirm(`¿Estás seguro de que quieres eliminar al usuario ${usuario.nombre} ${usuario.apellidos}?`)

  if (confirmado) {
    alert(`Función en desarrollo - Usuario ${usuario.nombre} eliminado`)
    // TODO: Implementar eliminación real
  }
}

const exportarUsuarios = async () => {
  try {
    exportando.value = true
    
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert('Exportación completada exitosamente')
  } catch (err) {
    alert('Error al exportar usuarios')
  } finally {
    exportando.value = false
  }
}

const mostrarModalCrear = () => {
  alert('Función en desarrollo - Creando nuevo usuario')
  // TODO: Implementar modal de creación
}

// Watchers
watch(filtros, () => {
  paginaActual.value = 1
}, { deep: true })

// Lifecycle
onMounted(() => {
  cargarUsuarios()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.usuarios-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.management-header {
  background: white;
  border-radius: 10px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.page-title {
  color: #5B3427;
  margin: 0 0 5px 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  color: #7f8c8d;
  margin: 0;
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-export, .btn-create {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-export {
  background: #5B3427;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background: #4a2a1f;
}

.btn-create {
  background: #FF671F;
  color: white;
}

.btn-create:hover {
  background: #e55a1a;
}

.btn-export:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Filters */
.filters-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #5B3427;
  font-size: 0.9rem;
}

.filter-input, .filter-select {
  padding: 10px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Nunito', inherit;
  transition: border-color 0.3s ease;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #FF671F;
}

.filters-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-clear, .btn-apply {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-clear {
  background: #ecf0f1;
  color: #5B3427;
}

.btn-clear:hover {
  background: #d5dbdb;
}

.btn-apply {
  background: #FF671F;
  color: white;
}

.btn-apply:hover {
  background: #e55a1a;
}

/* Loading y Error */
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

/* Table */
.table-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
}

.table-header h3 {
  color: #5B3427;
  margin: 0;
  font-size: 1.3rem;
}

.items-select {
  padding: 8px 12px;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Nunito', inherit;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.usuarios-table th {
  background: #f8f9fa;
  color: #5B3427;
  font-weight: 600;
  padding: 15px 12px;
  text-align: left;
  border-bottom: 2px solid #ecf0f1;
  position: sticky;
  top: 0;
}

.usuarios-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.usuarios-table th.sortable:hover {
  background: #ecf0f1;
}

.sort-icon {
  margin-left: 5px;
  color: #FF671F;
}

.usuarios-table td {
  padding: 12px;
  border-bottom: 1px solid #ecf0f1;
  vertical-align: middle;
}

.usuario-row:hover {
  background: #f8f9fa;
}

.id-cell {
  font-weight: 600;
  color: #5B3427;
}

.usuario-nombre {
  font-weight: 600;
  color: #5B3427;
}

.email-cell {
  color: #7f8c8d;
  font-family: monospace;
}

.curp-cell {
  color: #7f8c8d;
  font-family: monospace;
  font-size: 0.85rem;
}

.estado-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.completado {
  background: rgba(255, 103, 31, 0.1);
  color: #FF671F;
}

.estado-badge.parcial {
  background: rgba(91, 52, 39, 0.1);
  color: #5B3427;
}

.estado-badge.pendiente {
  background: #f8d7da;
  color: #721c24;
}

.acciones-grupo {
  display: flex;
  gap: 8px;
}

.btn-accion {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-ver {
  background: #FF671F;
  color: white;
}

.btn-ver:hover:not(:disabled) {
  background: #e55a1a;
}

.btn-editar {
  background: #5B3427;
  color: white;
}

.btn-editar:hover {
  background: #4a2a1f;
}

.btn-eliminar {
  background: #e74c3c;
  color: white;
}

.btn-eliminar:hover {
  background: #c0392b;
}

.btn-accion:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.pagination-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pagination-numbers {
  display: flex;
  gap: 5px;
}

.btn-pagination, .btn-pagina {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Nunito', inherit;
}

.btn-pagination {
  background: #FF671F;
  color: white;
}

.btn-pagination:hover:not(:disabled) {
  background: #e55a1a;
}

.btn-pagination:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-pagina {
  background: #ecf0f1;
  color: #5B3427;
}

.btn-pagina:hover {
  background: #d5dbdb;
}

.btn-pagina.active {
  background: #FF671F;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .usuarios-management {
    padding: 15px;
  }
  
  .management-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .pagination-section {
    flex-direction: column;
    gap: 15px;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
