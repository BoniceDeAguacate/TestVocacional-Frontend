<template>
  <div class="usuarios-crud">
    <!-- Header con diseño de 2 columnas -->
    <div class="crud-header">
      <div class="header-grid">
        <!-- Columna 1: Texto (2 filas) -->
        <div class="text-column">
          <h1 class="page-title">Gestión de Usuarios</h1>
          <p class="page-subtitle">Administra todos los usuarios registrados en el sistema</p>
        </div>
        
        <!-- Columna 2: Barra de búsqueda y botón exportar -->
        <div class="search-column">
          <div class="search-container">
            <div class="search-input-wrapper">
              <span class="search-icon"><i class="fas fa-search"></i></span>
              <input 
                v-model="filtros.busqueda"
                type="text" 
                placeholder="Buscar por nombre, email o CURP..."
                class="search-input"
                @input="buscarUsuarios"
              >
              <button 
                v-if="filtros.busqueda"
                @click="limpiarBusqueda"
                class="clear-search"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <!-- Filtros adicionales -->
            <div class="additional-filters" v-if="!cargando && !error">
              <select v-model="filtros.anio" class="filter-select" :disabled="aniosDisponibles.length === 0">
                <option value="">Todos los años</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>

  <select v-model="filtros.mesInicial" class="filter-select" :disabled="!filtros.anio">
                <option value="">Mes inicial</option>
                <option value="1">Enero</option>
                <option value="2">Febrero</option>
                <option value="3">Marzo</option>
                <option value="4">Abril</option>
                <option value="5">Mayo</option>
                <option value="6">Junio</option>
                <option value="7">Julio</option>
                <option value="8">Agosto</option>
                <option value="9">Septiembre</option>
                <option value="10">Octubre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </select>

              <select v-model="filtros.mesFinal" class="filter-select" :disabled="!filtros.anio || !filtros.mesInicial">
                <option value="">Mes final</option>
                <option v-for="mes in mesesFinalesDisponibles" :key="mes.value" :value="mes.value">
                  {{ mes.label }}
                </option>
              </select>
              
              <button 
                @click="eliminarUsuariosPorAnio" 
                class="btn-delete-year"
                v-if="filtros.anio && usuariosFiltrados.length > 0"
                :disabled="eliminandoPorAnio"
                title="Eliminar todos los usuarios del año seleccionado"
              >
                <i class="fas fa-trash-alt"></i>
                {{ eliminandoPorAnio ? 'Eliminando...' : `Eliminar ${usuariosFiltrados.length}` }}
              </button>
            </div>
            <button 
              @click="exportarExcel" 
              :disabled="exportando"
              class="btn-export"
            >
              <i class="fas fa-file-excel"></i>
              {{ exportando 
                  ? 'Exportando...' 
                  : (filtros.anio 
                      ? `Exportar ${filtros.anio}` 
                      : 'Exportar Excel') 
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros y búsqueda - ELIMINADO porque ahora está en el header -->

    <!-- Estadísticas rápidas -->
    <div v-if="cargando" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando usuarios...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3>Error al cargar usuarios</h3>
      <p>{{ error }}</p>
      <button @click="cargarUsuarios" class="btn-retry">Reintentar</button>
    </div>

    <!-- Tabla de usuarios -->
    <div v-else-if="usuariosFiltrados.length > 0" class="table-container">
      <div class="table-wrapper">
        <table class="usuarios-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>CURP</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="usuario in usuariosPaginados" 
              :key="usuario.id"
              class="usuario-row"
            >
              <td>
                <div class="user-info">
                  <div class="user-avatar">
                    {{ obtenerIniciales(usuario.nombre, usuario.apellidos) }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ usuario.nombre }} {{ usuario.apellidos }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="curp-badge">{{ usuario.curp }}</span>
              </td>
              <td>
                <span class="email">{{ usuario.email }}</span>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="verReporte(usuario.id, `${usuario.nombre} ${usuario.apellidos}`)"
                    class="btn-action btn-report"
                    title="Ver reporte"
                  >
                    <i class="fas fa-chart-bar"></i>
                  </button>
                  <button 
                    @click="abrirModalEdicion(usuario)"
                    class="btn-action btn-edit"
                    title="Editar usuario"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="eliminarUsuario(usuario)"
                    class="btn-action btn-delete"
                    title="Eliminar usuario"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="pagination-container">
        <div class="pagination-info">
          <span>{{ mensajePaginacion }}</span>
        </div>
        <div class="pagination-controls">
          <button 
            @click="irAPagina(paginacionLocal.paginaActual - 1)"
            :disabled="paginacionLocal.paginaActual <= 1"
            class="btn-pagination"
          >
            Anterior
          </button>
          
          <div class="page-numbers">
            <button
              v-for="pagina in obtenerPaginasVisibles()"
              :key="pagina"
              @click="irAPagina(pagina)"
              class="btn-page"
              :class="{ 'active': pagina === paginacionLocal.paginaActual }"
            >
              {{ pagina }}
            </button>
          </div>
          
          <button 
            @click="irAPagina(paginacionLocal.paginaActual + 1)"
            :disabled="paginacionLocal.paginaActual >= paginacionLocal.totalPaginas"
            class="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon"><i class="fas fa-users"></i></div>
      <h3>No se encontraron usuarios</h3>
      <p>
        {{ filtros.busqueda || filtros.anio
           ? 'Intenta ajustar los filtros de búsqueda manualmente' 
           : 'Aún no hay usuarios registrados en el sistema' }}
      </p>
      <button 
        v-if="!filtros.busqueda && !filtros.anio"
        @click="mostrarModalCrear" 
        class="btn-create"
      >
        <i class="fas fa-plus"></i> Crear primer usuario
      </button>
    </div>

    <!-- Modal de edición de usuario -->
    <div v-if="mostrarModal" class="modal-overlay" @click="cerrarModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-edit"></i> Editar Usuario</h2>
          <button @click="cerrarModal" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        
        <form @submit.prevent="guardarUsuario" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nombre">Nombre *</label>
              <input
                id="nombre"
                v-model="usuarioEdicion.nombre"
                type="text"
                class="form-input"
                :class="{ 'error': erroresValidacion.nombre }"
                placeholder="Ingresa el nombre"
                required
              >
              <span v-if="erroresValidacion.nombre" class="error-message">
                {{ erroresValidacion.nombre }}
              </span>
            </div>
            
            <div class="form-group">
              <label for="apellidos">Apellidos *</label>
              <input
                id="apellidos"
                v-model="usuarioEdicion.apellidos"
                type="text"
                class="form-input"
                :class="{ 'error': erroresValidacion.apellidos }"
                placeholder="Ingresa los apellidos"
                required
              >
              <span v-if="erroresValidacion.apellidos" class="error-message">
                {{ erroresValidacion.apellidos }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="usuarioEdicion.email"
                type="email"
                class="form-input"
                :class="{ 'error': erroresValidacion.email }"
                placeholder="correo@ejemplo.com"
                required
              >
              <span v-if="erroresValidacion.email" class="error-message">
                {{ erroresValidacion.email }}
              </span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label for="password">Nueva Contraseña (opcional)</label>
              <input
                id="password"
                v-model="usuarioEdicion.password"
                type="password"
                class="form-input"
                :class="{ 'error': erroresValidacion.password }"
                placeholder="Dejar vacío para mantener la actual"
                autocomplete="new-password"
              >
              <span v-if="erroresValidacion.password" class="error-message">
                {{ erroresValidacion.password }}
              </span>
              <small class="form-help">
                Si no deseas cambiar la contraseña, deja este campo vacío
              </small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group full-width">
              <label>CURP (Solo lectura)</label>
              <input
                :value="usuarioEdicion.curp"
                type="text"
                class="form-input readonly"
                readonly
                disabled
              >
              <small class="form-help">
                El CURP no puede ser modificado
              </small>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              type="button" 
              @click="cerrarModal" 
              class="btn-cancel"
              :disabled="guardandoUsuario"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="btn-save"
              :disabled="guardandoUsuario || !formularioValido"
            >
              {{ guardandoUsuario ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación masiva -->
    <div v-if="mostrarModalEliminacion" class="modal-overlay modal-overlay-delete" @click="cerrarModalEliminacion">
      <div class="modal-container modal-delete" @click.stop>
        <div class="modal-header modal-header-delete">
          <h2><i class="fas fa-exclamation-triangle"></i> Confirmar Eliminación Masiva</h2>
          <button @click="cerrarModalEliminacion" class="btn-close"><i class="fas fa-times"></i></button>
        </div>
        
        <div class="modal-body">
          <div class="warning-content">
            <div class="warning-icon">
              <i class="fas fa-trash-alt"></i>
            </div>
            <div class="warning-text">
              <h3>¿Estás seguro de eliminar todos los usuarios?</h3>
              <p>
                Esta acción eliminará permanentemente <strong>{{ datosPendientesEliminacion.cantidad }} usuarios</strong> 
                del año <strong>{{ datosPendientesEliminacion.anio }}</strong>.
              </p>
              <p class="warning-note">
                <i class="fas fa-info-circle"></i>
                Esta operación no se puede deshacer.
              </p>
            </div>
          </div>
          
          <div class="countdown-section" v-if="contadorConfirmacion > 0">
            <div class="countdown-timer">
              <i class="fas fa-clock"></i>
              Espera {{ contadorConfirmacion }} segundos para continuar
            </div>
            <div class="countdown-bar">
              <div 
                class="countdown-progress" 
                :style="{ width: `${((5 - contadorConfirmacion) / 5) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button 
            @click="confirmarEliminacionMasiva" 
            class="btn-confirm-delete"
            :class="{ 'btn-confirm-disabled': contadorConfirmacion > 0 }"
            :disabled="contadorConfirmacion > 0"
          >
            <i class="fas fa-trash"></i>
            {{ contadorConfirmacion > 0 ? `Eliminar (${contadorConfirmacion}s)` : 'Eliminar' }}
          </button>
          <button 
            @click="cerrarModalEliminacion" 
            class="btn-cancel-delete"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { obtenerTodosLosUsuarios, actualizarUsuario, eliminarUsuario as eliminarUsuarioApi, exportarReporteExcel } from '@/services/admin/adminService'
import { useAlert } from '@/composables/useAlert'

const router = useRouter()
const { showSuccess, showError, showConfirm } = useAlert()

// Estados reactivos
const usuarios = ref([])
const cargando = ref(true)
const error = ref(null)
const exportando = ref(false)
const eliminandoPorAnio = ref(false)

// Estados para modal de confirmación de eliminación masiva
const mostrarModalEliminacion = ref(false)
const contadorConfirmacion = ref(5)
const intervalID = ref(null)
const datosPendientesEliminacion = ref({
  usuarios: [],
  anio: null,
  mesInicial: '',
  mesFinal: '',
  cantidad: 0
})

// Estados del modal
const mostrarModal = ref(false)
const usuarioEdicion = ref({
  id: null,
  nombre: '',
  apellidos: '',
  email: '',
  role: '',
  password: '',
  curp: ''
})
const guardandoUsuario = ref(false)
const erroresValidacion = ref({})

// Filtros y búsqueda
const filtros = ref({
  busqueda: '',
  anio: '', 
  mesInicial: '', // Cambio: mes inicial
  mesFinal: ''    // Cambio: mes final
})

// Paginación del servidor
const paginacion = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 1
})

// Paginación local para filtros
const paginacionLocal = ref({
  paginaActual: 1,
  tamanioPagina: 10,
  totalPaginas: 1
})

// Computed properties para filtros avanzados
const aniosDisponibles = computed(() => {
  // Solo calcular años si los datos están cargados y no hay error
  if (cargando.value || error.value || !usuarios.value || usuarios.value.length === 0) {
    return []
  }
  
  const anios = new Set()
  usuarios.value.forEach(usuario => {
    if (usuario.createdAt) {
      const anio = new Date(usuario.createdAt).getFullYear()
      anios.add(anio)
    }
  })
  return Array.from(anios).sort((a, b) => b - a) // Ordenar de más reciente a más antiguo
})

// Método auxiliar para obtener el estado del usuario
const getEstadoUsuario = (usuario) => {
  // Para usuarios normales, necesitamos verificar si tienen resultados
  // Esto podría requerir información adicional del backend o asumir que todos son aspirantes
  return 'aspirante' // Por defecto, todos son aspirantes en esta vista
}

// Computed para obtener los meses finales disponibles (solo meses >= al mes inicial)
const mesesFinalesDisponibles = computed(() => {
  const meses = [
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ]
  
  if (!filtros.value.mesInicial) return meses
  
  const mesInicial = parseInt(filtros.value.mesInicial)
  return meses.filter(mes => parseInt(mes.value) >= mesInicial)
})

const usuariosFiltrados = computed(() => {
  let resultado = usuarios.value

  // Filtro por búsqueda de texto
  if (filtros.value.busqueda) {
    const busqueda = filtros.value.busqueda.toLowerCase()
    resultado = resultado.filter(usuario => 
      usuario.nombre.toLowerCase().includes(busqueda) ||
      usuario.apellidos.toLowerCase().includes(busqueda) ||
      usuario.email.toLowerCase().includes(busqueda) ||
      usuario.curp.toLowerCase().includes(busqueda)
    )
  }

  // Filtro por año de creación
  if (filtros.value.anio) {
    resultado = resultado.filter(usuario => {
      if (!usuario.createdAt) return false
      const anioUsuario = new Date(usuario.createdAt).getFullYear()
      return anioUsuario === filtros.value.anio
    })
  }

  // Filtro por rango de meses (mes inicial y final)
  if (filtros.value.anio && filtros.value.mesInicial) {
    const mesInicial = parseInt(filtros.value.mesInicial)
    const mesFinal = filtros.value.mesFinal ? parseInt(filtros.value.mesFinal) : mesInicial
    
    resultado = resultado.filter(usuario => {
      if (!usuario.createdAt) return false
      const fecha = new Date(usuario.createdAt)
      const mes = fecha.getMonth() + 1 // getMonth() es 0-indexado
      return mes >= mesInicial && mes <= mesFinal
    })
  }

  return resultado
})

const usuariosPaginados = computed(() => {
  const inicio = (paginacionLocal.value.paginaActual - 1) * paginacionLocal.value.tamanioPagina
  const fin = inicio + paginacionLocal.value.tamanioPagina
  return usuariosFiltrados.value.slice(inicio, fin)
})

// Computed para validación del formulario
const formularioValido = computed(() => {
  // Validaciones básicas requeridas
  const camposRequeridosValidos = usuarioEdicion.value.nombre.trim() &&
         usuarioEdicion.value.apellidos.trim() &&
         usuarioEdicion.value.email.trim()
  
  // No debe haber errores de validación
  const sinErrores = Object.keys(erroresValidacion.value).length === 0
  
  return camposRequeridosValidos && sinErrores
})

// Computed para mensaje de paginación más inteligente
const mensajePaginacion = computed(() => {
  const total = usuariosFiltrados.value.length
  const inicio = ((paginacionLocal.value.paginaActual - 1) * paginacionLocal.value.tamanioPagina) + 1
  const fin = Math.min(paginacionLocal.value.paginaActual * paginacionLocal.value.tamanioPagina, total)
  
  if (total === 0) {
    return 'No hay usuarios para mostrar'
  }
  
  if (total === 1) {
    return '1 usuario encontrado'
  }
  
  if (total <= paginacionLocal.value.tamanioPagina) {
    return `${total} usuarios en total`
  }
  
  if (inicio === fin) {
    return `Usuario ${inicio} de ${total}`
  }
  
  return `Usuarios ${inicio} - ${fin} de ${total}`
})

// Watchers
watch(usuariosFiltrados, (nuevosUsuarios) => {
  paginacionLocal.value.totalPaginas = Math.ceil(nuevosUsuarios.length / paginacionLocal.value.tamanioPagina)
  paginacionLocal.value.paginaActual = 1
})

watch(
  [() => filtros.value.busqueda, () => filtros.value.anio, () => filtros.value.mesInicial, () => filtros.value.mesFinal],
  ([, nuevoAnio, nuevoMesInicial], [, prevAnio, prevMesInicial]) => {
    if (paginacionLocal.value.paginaActual !== 1) {
      paginacionLocal.value.paginaActual = 1
    }
    
    // Si se cambia el año, limpiar los filtros de meses
    if (nuevoAnio !== prevAnio) {
      filtros.value.mesInicial = ''
      filtros.value.mesFinal = ''
    }
    
    // Si se cambia el mes inicial y es mayor que el mes final, limpiar el mes final
    if (nuevoMesInicial !== prevMesInicial && filtros.value.mesFinal) {
      const mesInicial = parseInt(nuevoMesInicial || '0')
      const mesFinal = parseInt(filtros.value.mesFinal)
      if (mesInicial > mesFinal) {
        filtros.value.mesFinal = ''
      }
    }
  }
)

watch(usuariosPaginados, () => {
  // Reset pagination if needed
})

// Estado para controlar si el usuario ha interactuado con los campos
const camposInteractuados = ref({
  nombre: false,
  apellidos: false,
  email: false,
  password: false
})

// Watchers para validación en tiempo real con retroalimentación inmediata
watch(() => usuarioEdicion.value.nombre, (nuevoNombre, valorAnterior) => {
  // Marcar como interactuado si el usuario ha cambiado el valor
  if (valorAnterior !== undefined) {
    camposInteractuados.value.nombre = true
  }
  
  // Validar solo si el campo ha sido interactuado
  if (camposInteractuados.value.nombre) {
    if (nuevoNombre.trim() === '') {
      erroresValidacion.value.nombre = 'El nombre es requerido'
    } else if (nuevoNombre.trim().length < 2) {
      erroresValidacion.value.nombre = 'El nombre debe tener al menos 2 caracteres'
    } else {
      delete erroresValidacion.value.nombre
    }
  }
})

watch(() => usuarioEdicion.value.apellidos, (nuevosApellidos, valorAnterior) => {
  // Marcar como interactuado si el usuario ha cambiado el valor
  if (valorAnterior !== undefined) {
    camposInteractuados.value.apellidos = true
  }
  
  // Validar solo si el campo ha sido interactuado
  if (camposInteractuados.value.apellidos) {
    if (nuevosApellidos.trim() === '') {
      erroresValidacion.value.apellidos = 'Los apellidos son requeridos'
    } else if (nuevosApellidos.trim().length < 2) {
      erroresValidacion.value.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    } else {
      delete erroresValidacion.value.apellidos
    }
  }
})

watch(() => usuarioEdicion.value.email, (nuevoEmail, valorAnterior) => {
  // Marcar como interactuado si el usuario ha cambiado el valor
  if (valorAnterior !== undefined) {
    camposInteractuados.value.email = true
  }
  
  // Validar solo si el campo ha sido interactuado
  if (camposInteractuados.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (nuevoEmail.trim() === '') {
      erroresValidacion.value.email = 'El email es requerido'
    } else if (!emailRegex.test(nuevoEmail)) {
      erroresValidacion.value.email = 'El formato del email no es válido'
    } else {
      delete erroresValidacion.value.email
    }
  }
})

watch(() => usuarioEdicion.value.password, (nuevaPassword, valorAnterior) => {
  // Marcar como interactuado si el usuario ha cambiado el valor
  if (valorAnterior !== undefined) {
    camposInteractuados.value.password = true
  }
  
  // Validar siempre la contraseña para dar retroalimentación inmediata
  if (nuevaPassword && nuevaPassword.trim() !== '') {
    if (nuevaPassword.length < 6) {
      erroresValidacion.value.password = 'La contraseña debe tener al menos 6 caracteres'
    } else {
      delete erroresValidacion.value.password
    }
  } else {
    // Si el campo está vacío, no hay error (contraseña opcional)
    delete erroresValidacion.value.password
  }
})

// Métodos principales
const cargarUsuarios = async () => {
  try {
    cargando.value = true
    error.value = null
    
    const respuesta = await obtenerTodosLosUsuarios(paginacion.value.page, paginacion.value.pageSize)
    
    if (respuesta.success && respuesta.data) {
      // Adaptarse a la estructura de respuesta del API
      if (respuesta.data.items) {
        usuarios.value = respuesta.data.items
        paginacion.value = {
          page: respuesta.data.page || 1,
          pageSize: respuesta.data.pageSize || 10,
          total: respuesta.data.total || 0,
          totalPages: respuesta.data.totalPages || 1
        }
      } else {
        // Fallback si la respuesta es directamente un array
        usuarios.value = Array.isArray(respuesta.data) ? respuesta.data : []
        paginacion.value.total = usuarios.value.length
      }
    } else {
      throw new Error(respuesta.message || 'Error al cargar usuarios')
    }
  } catch (err) {
    console.error('Error al cargar usuarios:', err)
    error.value = err.message || 'Error al cargar los usuarios'
    usuarios.value = []
  } finally {
    cargando.value = false
  }
}

const refrescarDatos = () => {
  cargarUsuarios()
}

const buscarUsuarios = () => {
  // La búsqueda se hace automáticamente por el computed
}

const limpiarBusqueda = () => {
  filtros.value.busqueda = ''
}

// Métodos de utilidad
const obtenerIniciales = (nombre, apellidos) => {
  const inicial1 = nombre?.charAt(0)?.toUpperCase() || ''
  const inicial2 = apellidos?.charAt(0)?.toUpperCase() || ''
  return inicial1 + inicial2
}

// Métodos de paginación
const irAPagina = (pagina) => {
  if (pagina >= 1 && pagina <= paginacionLocal.value.totalPaginas) {
    paginacionLocal.value.paginaActual = pagina
  }
}

const obtenerPaginasVisibles = () => {
  const total = paginacionLocal.value.totalPaginas
  const actual = paginacionLocal.value.paginaActual
  const paginas = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      paginas.push(i)
    }
  } else {
    if (actual <= 4) {
      for (let i = 1; i <= 5; i++) {
        paginas.push(i)
      }
      paginas.push('...', total)
    } else if (actual >= total - 3) {
      paginas.push(1, '...')
      for (let i = total - 4; i <= total; i++) {
        paginas.push(i)
      }
    } else {
      paginas.push(1, '...')
      for (let i = actual - 1; i <= actual + 1; i++) {
        paginas.push(i)
      }
      paginas.push('...', total)
    }
  }
  
  return paginas
}

// Métodos de acciones
const verUsuario = (usuarioId) => {
  // Implementar vista de detalles del usuario
  console.log('Ver usuario:', usuarioId)
}

const verReporte = (usuarioId, nombre) => {
  router.push({
    name: 'UsuarioReporte',
    params: { usuarioId },
    query: { nombre }
  })
}

// Métodos del modal
const abrirModalEdicion = (usuario) => {
  // Normalizar el rol para asegurar compatibilidad
  let rolUsuario = usuario.role || usuario.rol || 'aspirante'
  
  // Normalizar valores comunes del backend
  if (rolUsuario.toLowerCase() === 'administrator' || rolUsuario.toLowerCase() === 'administrador') {
    rolUsuario = 'admin'
  } else if (rolUsuario.toLowerCase() === 'user' || rolUsuario.toLowerCase() === 'usuario') {
    rolUsuario = 'aspirante'
  }
  
  usuarioEdicion.value = {
    id: usuario.id,
    nombre: usuario.nombre || '',
    apellidos: usuario.apellidos || '',
    email: usuario.email || '',
    role: rolUsuario,
    password: '', // No cargar la contraseña por seguridad
    curp: usuario.curp || ''
  }
  
  erroresValidacion.value = {}
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  usuarioEdicion.value = {
    id: null,
    nombre: '',
    apellidos: '',
    email: '',
    role: '',
    password: '',
    curp: ''
  }
  erroresValidacion.value = {}
  // Reiniciar el estado de campos interactuados
  camposInteractuados.value = {
    nombre: false,
    apellidos: false,
    email: false,
    password: false
  }
}

const validarFormulario = () => {
  const errores = {}
  
  // Validar nombre
  if (!usuarioEdicion.value.nombre.trim()) {
    errores.nombre = 'El nombre es requerido'
  } else if (usuarioEdicion.value.nombre.trim().length < 2) {
    errores.nombre = 'El nombre debe tener al menos 2 caracteres'
  }
  
  // Validar apellidos
  if (!usuarioEdicion.value.apellidos.trim()) {
    errores.apellidos = 'Los apellidos son requeridos'
  } else if (usuarioEdicion.value.apellidos.trim().length < 2) {
    errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!usuarioEdicion.value.email.trim()) {
    errores.email = 'El email es requerido'
  } else if (!emailRegex.test(usuarioEdicion.value.email)) {
    errores.email = 'El formato del email no es válido'
  }
  
  // Validar contraseña (solo si se proporcionó una)
  if (usuarioEdicion.value.password && usuarioEdicion.value.password.trim() !== '') {
    if (usuarioEdicion.value.password.length < 6) {
      errores.password = 'La contraseña debe tener al menos 6 caracteres'
    }
  }
  
  erroresValidacion.value = errores
  return Object.keys(errores).length === 0
}

const guardarUsuario = async () => {
  if (!validarFormulario()) {
    return
  }
  
  try {
    guardandoUsuario.value = true
    
    // Preparar datos para enviar (solo los campos que no están vacíos)
    const datosActualizacion = {
      nombre: usuarioEdicion.value.nombre.trim(),
      apellidos: usuarioEdicion.value.apellidos.trim(),
      email: usuarioEdicion.value.email.trim()
    }
    
    // Solo incluir password si se proporcionó
    if (usuarioEdicion.value.password) {
      datosActualizacion.password = usuarioEdicion.value.password
    }
    
    const respuesta = await actualizarUsuario(usuarioEdicion.value.id, datosActualizacion)
    
    if (respuesta.success) {
      // Actualizar usuario en la lista local
      const indice = usuarios.value.findIndex(u => u.id === usuarioEdicion.value.id)
      if (indice !== -1) {
        usuarios.value[indice] = { ...usuarios.value[indice], ...respuesta.data }
      }
      
      // Mostrar mensaje de éxito
      await showSuccess('Usuario actualizado exitosamente', '¡Cambios guardados!')
      
      // Cerrar modal
      cerrarModal()
    } else {
      // Mostrar error
      await showError(respuesta.message, 'Error al actualizar usuario')
    }
  } catch (error) {
    console.error('Error al guardar usuario:', error)
    await showError('Error inesperado al guardar el usuario', 'Error del sistema')
  } finally {
    guardandoUsuario.value = false
  }
}

const exportarExcel = async () => {
  exportando.value = true
  
  try {
    const respuesta = await exportarReporteExcel()
    
    if (respuesta.success) {
      // Importar la librería xlsx dinámicamente
      const XLSX = await import('xlsx')
      
      // Procesar los datos CSV
      const csvData = respuesta.data
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''))
      
      // Convertir CSV a array de objetos
      let data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, ''))
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      // Filtrar por año si hay un filtro activo
      if (filtros.value.anio) {
        data = data.filter(row => {
          if (!row.createdAt && !row.created_at) return false
          const createdAt = row.createdAt || row.created_at
          try {
            const fechaUsuario = new Date(createdAt)
            const anioUsuario = fechaUsuario.getFullYear()
            return anioUsuario === filtros.value.anio
          } catch (error) {
            console.warn('Error al parsear fecha:', createdAt)
            return false
          }
        })
        
        // Verificar si hay datos después del filtro
        if (data.length === 0) {
          await showInfo(`No se encontraron registros para el año ${filtros.value.anio}`, 'Sin datos para exportar')
          return
        }
      }
      
      // Crear workbook
      const workbook = XLSX.utils.book_new()
      
      // Definir mapeo y orden de columnas
      const columnDefinitions = [
       
        { key: 'curp', title: 'CURP', width: 22, type: 'text' },
        { key: 'nombre', title: 'Nombre', width: 18, type: 'text' },
        { key: 'apellidos', title: 'Apellidos', width: 18, type: 'text' },
        { key: 'email', title: 'Correo Electrónico', width: 30, type: 'text' },
        { key: 'createdAt', title: 'Fecha de Creación', width: 15, type: 'date' },
       
        { key: 'escuela_procedencia', title: 'Escuela de Procedencia', width: 25, type: 'text' },
        {key: 'genero', title: 'Género', width: 12, type: 'text' },
        { key: 'carrera_recomendada', title: 'Carrera Recomendada', width: 25, type: 'text' }
      ]
      
      // Formatear datos según las definiciones de columnas
      const processedData = data.map(row => {
        const newRow = {}
        columnDefinitions.forEach(col => {
          let value = row[col.key] || ''
            if (col.type === 'date' && value) {
            // Convertir fecha a formato solo fecha (DD/MM/YYYY)
            try {
              const fecha = new Date(value)
              value = fecha.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            } catch (error) {
              console.warn('Error al parsear fecha:', value)
              value = value // Mantener valor original si hay error
            }
          }
          
          // Formatear según el tipo de columna
          if (col.key === 'carrera_recomendada') {
            const carreraNames = {
              'salud': 'Ciencias de la Salud',
              'ingenieria': 'Ingenierías, Carreras Técnicas y Computación',
              'humanistica': 'Ciencias Humanísticas, Ciencias Jurídicas y Ciencias Sociales',
              'exactas': 'Ciencias Agrarias de la Naturaleza, Zoológicas y Biológicas',
              'economica': 'Administrativas, Contables y Económicas',
              'defensa': 'Defensa y Seguridad',
              'artistica': 'Artísticas'
            }
            value = carreraNames[value] || value || 'Sin asignar'
          }
          
          if (col.type === 'year' && value) {
            // Extraer año de la fecha ISO (ej: "2025-09-19T20:45:17.000Z" -> "2025")
            const fecha = new Date(value)
            value = fecha.getFullYear()
          }
          
          if (col.type === 'number') {
            value = parseInt(value) || 0
          }
          
          newRow[col.title] = value
        })
        return newRow
      })
      
      // Crear worksheet vacío para control manual
      const worksheet = {}
      
      // Definir título dinámico basado en el filtro
      const tituloReporte = filtros.value.anio 
        ? `REPORTE TEST VOCACIONAL - AÑO ${filtros.value.anio}`
        : 'REPORTE TEST VOCACIONAL'
      
      // Agregar título principal
      worksheet['A1'] = { 
        v: tituloReporte, 
        t: 's',
        s: {
          font: { bold: true, sz: 16 },
          alignment: { horizontal: 'center', vertical: 'center' }
        }
      }
      
      // Metadata
      worksheet['A3'] = { 
        v: `Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`, 
        t: 's',
        s: {
          font: { bold: true, sz: 12 },
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }
      
      worksheet['A4'] = { 
        v: `Total de registros: ${data.length}`, 
        t: 's',
        s: {
          font: { bold: true, sz: 12 },
          alignment: { horizontal: 'left', vertical: 'center' }
        }
      }

      // Agregar información del filtro si aplica
      let headerRow = 6
      if (filtros.value.anio) {
        worksheet['A5'] = { 
          v: `Filtrado por año: ${filtros.value.anio}`, 
          t: 's',
          s: {
            font: { bold: true, sz: 12, color: { rgb: "FF0000" } },
            alignment: { horizontal: 'left', vertical: 'center' }
          }
        }
        headerRow = 7 // Mover headers una fila más abajo cuando hay filtro
      }
      
      // Headers de columnas
      columnDefinitions.forEach((col, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: headerRow - 1, c: index })
        worksheet[cellAddress] = {
          v: col.title,
          t: 's',
          s: {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'center', vertical: 'center' }
          }
        }
      })
      
      // Datos
      processedData.forEach((row, rowIndex) => {
        const dataRowIndex = headerRow + rowIndex // Empezar después del header
        
        columnDefinitions.forEach((col, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({ r: dataRowIndex, c: colIndex })
          const cellValue = row[col.title]
          
          worksheet[cellAddress] = {
            v: cellValue,
            t: col.type === 'number' ? 'n' : 's',
            s: {
              font: { sz: 11 },
              alignment: { 
                horizontal: col.type === 'number' ? 'center' : 'left', 
                vertical: 'center',
                wrapText: col.key === 'carrera_recomendada'
              }
            }
          }
        })
      })
      
      // Definir rango del worksheet
      const lastRow = headerRow + processedData.length
      const lastCol = columnDefinitions.length - 1
      worksheet['!ref'] = `A1:${XLSX.utils.encode_cell({ r: lastRow, c: lastCol })}`
      
      // Configurar anchos de columna
      worksheet['!cols'] = columnDefinitions.map(col => ({ wch: col.width }))
      
      // Configurar merge cells
      worksheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } }, // Título principal
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } }, // Fecha
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } }  // Total registros
      ]
      
      // Configurar AutoFilter para la tabla de datos
      // El rango de la tabla incluye headers y datos (desde fila 6 hasta la última fila)
      const tableStartRow = headerRow - 1 // Fila 5 (0-indexed)
      const tableEndRow = lastRow // Última fila con datos
      worksheet['!autofilter'] = {
        ref: `A${tableStartRow + 1}:${XLSX.utils.encode_cell({ r: tableEndRow, c: lastCol })}`
      }
      
      // Configurar rango como tabla de Excel
      const tableName = 'TablaReporteTestVocacional'
      const tableRef = `A${tableStartRow + 1}:${XLSX.utils.encode_cell({ r: tableEndRow, c: lastCol })}`
      
      // Agregar definición de tabla (esto mejora la funcionalidad en Excel)
      if (!worksheet['!tables']) {
        worksheet['!tables'] = []
      }
      
      worksheet['!tables'].push({
        name: tableName,
        ref: tableRef,
        headerRow: true,
        style: {
          theme: 'TableStyleLight1', // Estilo de tabla simple sin colores
          showFirstColumn: false,
          showLastColumn: false,
          showRowStripes: false, // Sin filas alternadas
          showColumnStripes: false
        }
      })
      
      // Configurar filtros automáticos mejorados
      worksheet['!autofilter'] = { ref: tableRef }
      
      // Freeze panes para mantener headers visibles
      worksheet['!freeze'] = { 
        xSplit: 0, 
        ySplit: headerRow, // Congelar hasta la fila de headers
        topLeftCell: `A${headerRow + 1}` 
      }
      
      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Test Vocacional')
      
      // Generar nombre de archivo dinámico
      const fecha = new Date().toISOString().split('T')[0]
      const hora = new Date().toTimeString().slice(0, 5).replace(':', '')
      const anioSufijo = filtros.value.anio ? `_${filtros.value.anio}` : ''
      const fileName = `reporteTestVocacional${anioSufijo}_${fecha}_${hora}.xlsx`
      
      // Descargar archivo
      XLSX.writeFile(workbook, fileName)
      
      // Mensaje dinámico según el filtro
      const mensajeExito = filtros.value.anio 
        ? `Reporte del año ${filtros.value.anio} exportado exitosamente (${data.length} registros)`
        : `Reporte completo exportado exitosamente (${data.length} registros)`
      
      await showSuccess(
        mensajeExito, 
        'Exportación completada'
      )
    } else {
      await showError(respuesta.message, 'Error al exportar')
    }
  } catch (error) {
    console.error('Error al exportar:', error)
    await showError('Error inesperado al exportar el reporte', 'Error del sistema')
  } finally {
    exportando.value = false
  }
}

const eliminarUsuario = async (usuario) => {
  // Confirmar eliminación con SweetAlert
  const resultado = await showConfirm(
    `¿Estás seguro de que deseas eliminar al usuario "${usuario.nombre} ${usuario.apellidos}"?\n\nEsta acción no se puede deshacer.`,
    'Confirmar eliminación'
  )
  
  if (!resultado.isConfirmed) {
    return
  }
  
  try {
    // Mostrar indicador de carga (opcional, podrías agregar un estado loading)
    const respuesta = await eliminarUsuarioApi(usuario.id)
    
    if (respuesta.success) {
      // Eliminar usuario de la lista local
      const indice = usuarios.value.findIndex(u => u.id === usuario.id)
      if (indice !== -1) {
        usuarios.value.splice(indice, 1)
      }
      
      // Actualizar contadores de paginación
      paginacion.value.total = Math.max(0, paginacion.value.total - 1)
      
      // Mostrar mensaje de éxito
      await showSuccess('Usuario eliminado exitosamente', 'Usuario eliminado')
      
      // Si la página actual se queda vacía, ir a la página anterior
      if (usuariosPaginados.value.length === 0 && paginacionLocal.value.paginaActual > 1) {
        paginacionLocal.value.paginaActual -= 1
      }
    } else {
      // Mostrar error
      await showError(respuesta.message, 'Error al eliminar usuario')
    }
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    await showError('Error inesperado al eliminar el usuario', 'Error del sistema')
  }
}

const eliminarUsuariosPorAnio = async () => {
  if (!filtros.value.anio || usuariosFiltrados.value.length === 0) {
    return
  }
  
  const usuariosAEliminar = usuariosFiltrados.value
  const anioSeleccionado = filtros.value.anio
  const mesInicial = filtros.value.mesInicial
  const mesFinal = filtros.value.mesFinal
  
  // Configurar datos para el modal personalizado
  datosPendientesEliminacion.value = {
    usuarios: usuariosAEliminar,
    anio: anioSeleccionado,
    mesInicial: mesInicial,
    mesFinal: mesFinal,
    cantidad: usuariosAEliminar.length
  }
  
  // Abrir modal y iniciar contador
  mostrarModalEliminacion.value = true
  iniciarContadorConfirmacion()
}

const iniciarContadorConfirmacion = () => {
  contadorConfirmacion.value = 5
  
  intervalID.value = setInterval(() => {
    contadorConfirmacion.value--
    
    if (contadorConfirmacion.value <= 0) {
      clearInterval(intervalID.value)
    }
  }, 1000)
}

const cerrarModalEliminacion = () => {
  mostrarModalEliminacion.value = false
  if (intervalID.value) {
    clearInterval(intervalID.value)
  }
  contadorConfirmacion.value = 5
  datosPendientesEliminacion.value = {
    usuarios: [],
    anio: null,
    mesInicial: '',
    mesFinal: '',
    cantidad: 0
  }
}

const confirmarEliminacionMasiva = async () => {
  if (contadorConfirmacion.value > 0) {
    return // No permitir confirmar hasta que pase el tiempo
  }

  // Guardar datos antes de cerrar el modal (para mostrar en el mensaje)
  const { usuarios: usuariosAEliminar, anio: anioSeleccionado, mesInicial, mesFinal } = datosPendientesEliminacion.value

  cerrarModalEliminacion()

  try {
    eliminandoPorAnio.value = true
    let exitosos = 0
    let fallidos = 0
    
    // Eliminar usuarios uno por uno (se podría optimizar con una API de eliminación masiva)
    for (const usuario of usuariosAEliminar) {
      try {
        const respuesta = await eliminarUsuarioApi(usuario.id)
        
        if (respuesta.success) {
          // Eliminar usuario de la lista local
          const indice = usuarios.value.findIndex(u => u.id === usuario.id)
          if (indice !== -1) {
            usuarios.value.splice(indice, 1)
          }
          exitosos++
        } else {
          fallidos++
          console.error(`Error al eliminar usuario ${usuario.id}:`, respuesta.message)
        }
      } catch (error) {
        fallidos++
        console.error(`Error al eliminar usuario ${usuario.id}:`, error)
      }
    }
    
    // Actualizar contadores de paginación
    paginacion.value.total = Math.max(0, paginacion.value.total - exitosos)
    
    // Limpiar filtros después de la eliminación
    filtros.value.anio = ''
    filtros.value.mesInicial = ''
    filtros.value.mesFinal = ''
    
    // Resetear paginación a la primera página
    paginacionLocal.value.paginaActual = 1
    
    // Mostrar resultado
    let mensajeRango = ''
    if (mesInicial) {
      const meses = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      const mesInicialTexto = meses[parseInt(mesInicial)]
      const mesFinalTexto = mesFinal ? meses[parseInt(mesFinal)] : mesInicialTexto
      
      if (mesInicial === mesFinal || !mesFinal) {
        mensajeRango = ` (${mesInicialTexto})`
      } else {
        mensajeRango = ` (${mesInicialTexto} - ${mesFinalTexto})`
      }
    }
    
    if (fallidos === 0) {
      await showSuccess(
        `Se eliminaron exitosamente ${exitosos} usuarios del año ${anioSeleccionado}${mensajeRango}`,
        'Eliminación masiva completada'
      )
    } else {
      await showError(
        `Se eliminaron ${exitosos} usuarios exitosamente, pero ${fallidos} usuarios no pudieron ser eliminados. Revisa la consola para más detalles.`,
        'Eliminación parcialmente completada'
      )
    }
    
  } catch (error) {
    console.error('Error en eliminación masiva:', error)
    await showError('Error inesperado durante la eliminación masiva', 'Error del sistema')
  } finally {
    eliminandoPorAnio.value = false
  }
}

// Función helper para obtener el texto del rango de meses
const obtenerTextoRangoMeses = () => {
  const { mesInicial, mesFinal } = datosPendientesEliminacion.value
  
  if (!mesInicial) return ''
  
  const meses = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const mesInicialTexto = meses[parseInt(mesInicial)]
  const mesFinalTexto = mesFinal ? meses[parseInt(mesFinal)] : mesInicialTexto
  
  if (mesInicial === mesFinal || !mesFinal) {
    return ` (${mesInicialTexto})`
  } else {
    return ` (${mesInicialTexto} - ${mesFinalTexto})`
  }
}

// Ciclo de vida
onMounted(() => {
  cargarUsuarios()
})

onUnmounted(() => {
  // Limpiar interval si existe para evitar memory leaks
  if (intervalID.value) {
    clearInterval(intervalID.value)
  }
})
</script>

<style scoped>
.usuarios-crud {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Nunito', sans-serif;
}

/* Header */
.crud-header {
  margin-bottom: 30px;
  background: #ffffff;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-grid {
  display: grid;
  grid-template-columns: 1fr minmax(300px, 400px);
  gap: 30px;
  align-items: center;
}

/* Columna 1: Texto (2 filas) */
.text-column {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0; /* Permite que el texto se contraiga */
}

.page-title {
  color: #5B3427;
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
}

/* Columna 2: Búsqueda */
.search-column {
  display: flex;
  align-items: center;
  min-width: 0; /* Permite que la búsqueda se contraiga */
}

.search-column .search-container {
  margin-bottom: 0;
  box-shadow: none;
  width: 100%;
  max-width: 400px;
  min-width: 250px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-column .search-input-wrapper {
  width: 100%;
}

.btn-refresh, .btn-export, .btn-create {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-refresh {
  background: #6c757d;
  color: white;
}

.btn-refresh:hover:not(:disabled) {
  background: #545b62;
  transform: translateY(-2px);
}

.btn-export {
  background: #28a745;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  min-width: 150px;
}

.btn-export:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-export:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.btn-create {
  background: #FF671F;
  color: white;
}

.btn-create:hover {
  background: #5B3427;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
}

.btn-refresh:disabled, .btn-export:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Filtros */
.filters-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: #6c757d;
}

.search-input {
  width: 100%;
  min-width: 200px; /* Asegurar ancho mínimo */
  padding: 15px 15px 15px 50px;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box; /* Asegurar que el padding se incluya en el ancho */
}

.search-input:focus {
  outline: none;
  border-color: #FF671F;
  box-shadow: 0 0 0 3px rgba(255, 103, 31, 0.1);
}

.clear-search {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #6c757d;
  padding: 5px;
}

.clear-search:hover {
  color: #dc3545;
}

/* Filtros adicionales */
.additional-filters {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Nunito', inherit;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #FF671F;
}

.filter-select:disabled {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Botón eliminar por año */
.btn-delete-year {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-height: 36px;
}

.btn-delete-year:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

.btn-delete-year:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Botón limpiar filtros mejorado */
.btn-clear-filters {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-height: 36px;
  min-width: fit-content;
}

.btn-clear-filters:hover {
  background: #545b62;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-text {
  display: inline;
}

/* Responsivo para botones */
@media (max-width: 640px) {
  .btn-text {
    display: none;
  }
  
  .btn-clear-filters,
  .btn-delete-year {
    padding: 8px;
    min-width: 36px;
    justify-content: center;
  }
}

/* Estadísticas */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: #FF671F;
  color: white;
  padding: 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-icon {
  font-size: 2rem;
  opacity: 0.9;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.stat-content p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* Estados de carga */
.loading-container, .error-container {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FF671F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.btn-retry {
  background: #FF671F;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 15px;
}

.btn-retry:hover {
  background: #5B3427;
  transform: translateY(-2px);
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
}

.usuarios-table th {
  background: #FF671F;
  color: white;
  padding: 18px 15px;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.usuarios-table th:first-child {
  width: 200px;
  text-align: center;
}

.usuarios-table th:last-child {
  width: 200px;
  text-align: center;
}

.usuario-row {
  border-bottom: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.usuario-row:hover {
  background: #f8f9fa;
}

.usuarios-table td {
  padding: 15px;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  flex-shrink: 0; /* Evita que el avatar se reduzca */
  width: 50px; /* Tamaño fijo del avatar */
  height: 50px;
  border-radius: 50%;
  background-color: #FF671F; /* Color de fondo para el avatar */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  margin-right: 10px; /* Espaciado entre el avatar y los detalles */
}

.user-details {
  flex-grow: 1; /* Permite que los detalles ocupen el espacio disponible */
  min-width: 0; /* Evita que el contenedor colapse */
  max-width: 200px; /* Define un tamaño máximo para el contenedor */
  overflow: hidden; /* Oculta el contenido que exceda el contenedor */
  text-overflow: ellipsis; /* Agrega puntos suspensivos al texto truncado */
  white-space: nowrap; /* Evita que el texto se divida en varias líneas */
}

.user-name {
  white-space: nowrap; /* Evita que el texto se divida en varias líneas */
  overflow: hidden; /* Oculta el texto que exceda el contenedor */
  text-overflow: ellipsis; /* Agrega puntos suspensivos al texto truncado */
}

.curp-badge {
  background: #e9ecef;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
}

.email {
  color: #495057;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.btn-action {
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.btn-view {
  background: #5B3427;
}

.btn-view:hover {
  background: #4a2b1f;
  transform: translateY(-2px);
}

.btn-report {
  background: #6d3f2a;
}

.btn-report:hover {
  background: #5a3423;
  transform: translateY(-2px);
}

.btn-edit {
  background: #7a4a2e;
}

.btn-edit:hover {
  background: #653d26;
  transform: translateY(-2px);
}

.btn-delete {
  background: #8b5a3c;
}

.btn-delete:hover {
  background: #754b32;
  transform: translateY(-2px);
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-pagination {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-pagination:hover:not(:disabled) {
  background: #FF671F;
  color: white;
  border-color: #FF671F;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.btn-page {
  width: 35px;
  height: 35px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-page:hover {
  background: #FF671F;
  color: white;
  border-color: #FF671F;
}

.btn-page.active {
  background: #5B3427;
  color: white;
  border-color: #5B3427;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  color: #495057;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.empty-state p {
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

/* Responsive */
/* Tablets medianas */
@media (max-width: 1024px) {
  .header-grid {
    grid-template-columns: 1fr minmax(250px, 350px);
    gap: 20px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
}

/* Tablets pequeñas */
@media (max-width: 900px) {
  .header-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .text-column {
    text-align: center;
  }
  
  .search-column .search-container {
    max-width: 100%;
    min-width: auto;
  }
}

/* Móviles */
@media (max-width: 768px) {
  .usuarios-crud {
    padding: 15px;
  }

  .crud-header {
    text-align: center;
    padding: 20px;
  }

  .header-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .text-column {
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .search-column .search-container {
    width: 100%;
    max-width: 100%;
    min-width: auto;
  }

  .stats-container {
    grid-template-columns: 1fr;
  }

  .search-input-wrapper {
    max-width: none;
  }

  .search-input {
    min-width: 150px;
    font-size: 0.9rem;
    padding: 12px 12px 12px 45px;
  }
  
  .search-icon {
    left: 12px;
    font-size: 1rem;
  }
  
  .clear-search {
    right: 12px;
    font-size: 0.9rem;
  }
  
  /* Filtros adicionales en móvil */
  .additional-filters {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .filter-select {
    min-width: auto;
    width: 100%;
    padding: 10px 12px;
  }
  
  .btn-delete-year {
    width: 100%;
    justify-content: center;
    padding: 12px;
  }
}

/* Móviles muy pequeños */
@media (max-width: 480px) {
  .crud-header {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.3rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .search-input {
    min-width: 120px;
    padding: 10px 10px 10px 40px;
  }
  
  .search-icon {
    left: 10px;
    font-size: 0.9rem;
  }
  
  .clear-search {
    right: 10px;
  }

  .table-wrapper {
    font-size: 0.9rem;
  }

  .user-info {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }

  .action-buttons {
    flex-wrap: wrap;
    gap: 5px;
  }

  .pagination-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .page-numbers {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .usuarios-table th,
  .usuarios-table td {
    padding: 10px 8px;
  }

  .btn-action {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  /* Filtros adicionales en móviles pequeños */
  .filter-select {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
  
  .btn-clear-filters {
    padding: 8px;
    font-size: 0.9rem;
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { 
    transform: translateY(-50px);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 2px solid #f8f9fa;
  background: #FF671F;
  color: white;
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.modal-form {
  padding: 30px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #5B3427;
  font-size: 0.9rem;
}

.form-input, .form-select {
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #FF671F;
  box-shadow: 0 0 0 3px rgba(255, 103, 31, 0.1);
}

.form-input.error, .form-select.error {
  border-color: #dc3545;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.form-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 5px;
  font-weight: 500;
}

.form-help {
  color: #6c757d;
  font-size: 0.8rem;
  margin-top: 5px;
  font-style: italic;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-cancel, .btn-save {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  background: #545b62;
  transform: translateY(-2px);
}

.btn-save {
  background: #FF671F;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #5B3427;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
}

.btn-cancel:disabled, .btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive modal */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 20px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-header h2 {
    font-size: 1.3rem;
  }
  
  .modal-form {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .btn-cancel, .btn-save {
    width: 100%;
  }
}

/* Modal de eliminación masiva */
.modal-delete {
  max-width: 500px;
  width: 90%;
  position: relative;
  margin: 0;
}

/* Overlay específico para modal de eliminación - Centrado forzado */
.modal-overlay-delete {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 1001 !important;
  background: rgba(0, 0, 0, 0.6) !important;
  padding: 20px !important;
  box-sizing: border-box !important;
}

.modal-header-delete {
  background: #dc3545;
  color: white;
}

.modal-body {
  padding: 30px;
}

.modal-delete .modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 0 30px 30px 30px;
  padding-top: 25px;
  border-top: 1px solid #e9ecef;
}

.warning-content {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 25px;
}

.warning-icon {
  font-size: 3rem;
  color: #dc3545;
  flex-shrink: 0;
}

.warning-text h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.2rem;
  font-weight: 600;
}

.warning-text p {
  margin: 0 0 10px 0;
  color: #6c757d;
  line-height: 1.5;
}

.warning-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 12px 15px;
  color: #856404 !important;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}

.warning-note i {
  color: #f39c12;
}

.countdown-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  border: 2px solid #e9ecef;
}

.countdown-timer {
  font-size: 1.1rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.countdown-timer i {
  color: #dc3545;
}

.countdown-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.countdown-progress {
  height: 100%;
  background: linear-gradient(90deg, #dc3545, #c82333);
  border-radius: 4px;
  transition: width 1s linear;
}

.btn-cancel-delete, .btn-confirm-delete {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.btn-cancel-delete {
  background: #007bff;
  color: white;
}

.btn-cancel-delete:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-confirm-delete {
  background: #dc3545;
  color: white;
}

.btn-confirm-delete:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.btn-confirm-disabled {
  background: #6c757d !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: none !important;
}

/* Responsive para modal de eliminación */
@media (max-width: 768px) {
  .modal-delete {
    width: 95%;
    max-width: none;
    margin: 0;
  }
  
  .modal-overlay-delete {
    padding: 10px !important;
  }
  
  .warning-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .warning-icon {
    align-self: center;
  }
  
  .modal-delete .modal-actions {
    flex-direction: column;
    margin: 0 20px 20px 20px;
  }
  
  .btn-cancel-delete, .btn-confirm-delete {
    width: 100%;
  }
}
</style>
