<template>
  <div class="resultados-display">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando resultados...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error"> 
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3>Error al cargar los resultados</h3>
      <p>{{ error }}</p>
      <button @click="cargarResultados" class="retry-btn">Reintentar</button>
    </div>

    <!-- Results content -->
    <div v-else-if="resultados.length > 0" class="resultados-content">
      <!-- Botón para guardar PDF, oculto en impresión/pdf -->
      <div class="pdf-btn-container no-print" style="display: flex; justify-content: flex-end; margin-bottom: 20px;">
        <button @click="generarPDF" :disabled="generandoPDF" class="btn btn-danger">
          <i class="fas fa-file-pdf"></i>
          {{ generandoPDF ? 'Generando PDF...' : 'Guardar PDF' }}
        </button>
      </div>

      <!-- Resumen general -->
      <div class="resumen">
        <h3>Resumen General</h3>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-number">{{ materiasUnicas.length }}</span>
            <span class="stat-label">Materias Evaluadas</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ totalRespuestas }}</span>
            <span class="stat-label">Preguntas Respondidas</span>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{ totalRespuestasPositivas }}</span>
            <span class="stat-label">Respuestas Positivas</span>
          </div>
        </div>
      </div>

      <!-- Resultados por materia -->
      <div class="materias-grid">
        <div v-for="materia in materiasAgrupadas" :key="materia.nombre" class="materia-card">
          <div class="materia-header">
            <h4 class="materia-nombre">{{ formatearNombreMateria(materia.nombre) }}</h4>
            <div class="materia-icon"><i class="fas fa-graduation-cap"></i></div>
          </div>
          
          <div class="tipos-container">
            <div v-for="tipo in materia.tipos" :key="tipo.tipo" class="tipo-item">
              <div class="tipo-header">
                <span class="tipo-label">{{ tipo.tipo_texto }}</span>
                <span class="porcentaje" :class="{ 'sin-respuestas': calcularPorcentaje(tipo) === 0 }">
                  {{ calcularPorcentaje(tipo) }}%
                </span>
              </div>
              
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: calcularPorcentaje(tipo) + '%' }"
                  :class="{ 
                    'aptitud': tipo.tipo === 0, 
                    'interes': tipo.tipo === 1 
                  }"
                ></div>
              </div>
              
              <div class="tipo-details">
                <span>{{ tipo.total_respuestas_usuario }} de {{ tipo.total_preguntas_materia_tipo }} preguntas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Materia recomendada -->
      <div class="recomendacion">
        <div class="recomendacion-header">
          <h3>Carrera recomendada</h3>
        </div>
        
        <div class="materia-recomendada">
          <div v-if="materiaRecomendada.nombre === 'Sin recomendación'" class="sin-recomendacion">
            <div class="sin-recomendacion-header">
              <i class="fas fa-question-circle"></i>
              <h4>No podemos hacer una recomendación</h4>
            </div>
            <p class="sin-recomendacion-descripcion">
              Para poder recomendarte una carrera, necesitamos que respondas "Sí" a al menos algunas actividades que realmente te gusten o en las que te sientas hábil.
            </p>
            <div class="mensaje-sugerencia">
              <span class="icono-info"><i class="fas fa-lightbulb"></i></span>
              <span>Intenta realizar el test nuevamente pensando en actividades que disfrutas o materias que se te facilitan.</span>
            </div>
          </div>
          
          <div v-else class="carrera-principal">
            <h4>{{ formatearNombreMateria(materiaRecomendada.nombre) }}</h4>
            <div v-if="materiaRecomendada.puntuacion > 0" class="puntuacion-badge">
              {{ materiaRecomendada.puntuacion }}% compatibilidad
            </div>
          </div>
          
          <p v-if="materiaRecomendada.nombre !== 'Sin recomendación' && materiaRecomendada.puntuacion > 0" class="descripcion">
            Basado en tu mayor puntuación combinada de aptitud e interés{{ hayEmpateEnRecomendacion ? ' (en caso de empate, se ordenan alfabéticamente)' : '' }}
          </p>
          <p v-else-if="materiaRecomendada.nombre !== 'Sin recomendación'" class="sin-preferencias">
            No se encontraron preferencias marcadas. Recomendamos realizar el test nuevamente.
          </p>
          
          <!-- Lista de carreras específicas -->
          <div v-if="materiaRecomendada.nombre !== 'Sin recomendación' && materiaRecomendada.puntuacion > 0" class="carreras-lista">
            <div class="carreras-grid">
              <div 
                v-for="carrera in formatearCarrerasRecomendadas(materiaRecomendada.nombre)" 
                :key="carrera"
                class="carrera-item"
              >
                {{ carrera }}
              </div>
            </div>
          </div>
          
          <div v-if="materiaRecomendada.nombre !== 'Sin recomendación' && materiaRecomendada.puntuacion === 0" class="mensaje-reintento">
            <span class="icono-info"><i class="fas fa-lightbulb"></i></span>
            <span>Responde "Sí" a las actividades que realmente te gustan o en las que te sientes hábil.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon"><i class="fas fa-clipboard-list"></i></div>
      <h3>{{ obtenerTituloEmptyState }}</h3>
      <p>{{ obtenerDescripcionEmptyState }}</p>
      <router-link v-if="!esAdmin" to="/aspirante/test" class="btn-primary">
        Realizar Test Vocacional
      </router-link>
    </div>
  </div>
</template>

<script>
import { obtenerResultadosTest, obtenerCurpUsuario } from '../../services/aspirante/aspiranteService';
import html2pdf from 'html2pdf.js';

export default {
  name: 'TablaResultados',
  props: {
    usuarioId: {
      type: [String, Number],
      default: null
    },
    usuarioCurp: {
      type: String,
      default: null
    },
    esAdmin: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resultados: [],
      usuarioInfo: null,
      loading: true,
      error: null,
      generandoPDF: false
    };
  },
  computed: {
    materiasUnicas() {
      return [...new Set(this.resultados.map(r => r.materia))];
    },
    
    totalRespuestas() {
      return this.resultados.reduce((sum, r) => sum + r.total_preguntas_materia_tipo, 0);
    },
    
    totalRespuestasPositivas() {
      return this.resultados.reduce((sum, r) => sum + r.total_respuestas_usuario, 0);
    },
    
    materiasAgrupadas() {
      const agrupadas = {};
      
      this.resultados.forEach(resultado => {
        if (!agrupadas[resultado.materia]) {
          agrupadas[resultado.materia] = {
            nombre: resultado.materia,
            tipos: []
          };
        }
        agrupadas[resultado.materia].tipos.push(resultado);
      });
      
      return Object.values(agrupadas);
    },
    
    hayEmpateEnRecomendacion() {
      if (!this.materiasAgrupadas || this.materiasAgrupadas.length === 0) return false;
      
      const puntuacionesPorMateria = {};
      
      this.materiasAgrupadas.forEach(materia => {
        let puntuacionTotal = 0;
        let hasRespuestas = false;
        
        materia.tipos.forEach(tipo => {
          const porcentaje = this.calcularPorcentaje(tipo);
          puntuacionTotal += porcentaje;
          if (tipo.total_respuestas_usuario > 0) {
            hasRespuestas = true;
          }
        });
        
        if (hasRespuestas) {
          const puntuacion = Math.round(puntuacionTotal / materia.tipos.length);
          if (!puntuacionesPorMateria[puntuacion]) {
            puntuacionesPorMateria[puntuacion] = [];
          }
          puntuacionesPorMateria[puntuacion].push(materia.nombre);
        }
      });
      
      const materias = Object.values(puntuacionesPorMateria);
      if (materias.length === 0) return false;
      
      // Buscar la puntuación más alta
      const puntuacionesOrdenadas = Object.keys(puntuacionesPorMateria)
        .map(Number)
        .sort((a, b) => b - a);
      
      const puntuacionMasAlta = puntuacionesOrdenadas[0];
      return puntuacionesPorMateria[puntuacionMasAlta].length > 1;
    },
    
    materiaRecomendada() {
      const puntuacionesPorMateria = {};
      
      this.materiasAgrupadas.forEach(materia => {
        let puntuacionTotal = 0;
        let totalPreguntas = 0;
        let hasRespuestas = false;
        
        materia.tipos.forEach(tipo => {
          const porcentaje = this.calcularPorcentaje(tipo);
          puntuacionTotal += porcentaje;
          totalPreguntas += tipo.total_preguntas_materia_tipo;
          if (tipo.total_respuestas_usuario > 0) {
            hasRespuestas = true;
          }
        });
        
        // Solo considerar materias que tengan al menos una respuesta positiva
        if (hasRespuestas) {
          puntuacionesPorMateria[materia.nombre] = {
            nombre: materia.nombre,
            puntuacion: Math.round(puntuacionTotal / materia.tipos.length)
          };
        }
      });
      
      const materias = Object.values(puntuacionesPorMateria);
      
      // Si no hay materias con respuestas positivas, verificar si hay datos del test
      if (materias.length === 0) {
        // Si hay datos del test pero sin respuestas positivas, no recomendar nada
        if (this.materiasAgrupadas.length > 0 && this.totalRespuestasPositivas === 0) {
          return { nombre: 'Sin recomendación', puntuacion: 0 };
        }
        
        // Si no hay datos del test en absoluto, también sin recomendación
        return { nombre: 'Sin recomendación', puntuacion: 0 };
      }
      
      // Desempate determinístico para materias con respuestas positivas
      return materias.sort((a, b) => {
        // Primero por puntuación (descendente)
        if (b.puntuacion !== a.puntuacion) {
          return b.puntuacion - a.puntuacion;
        }
        // En caso de empate, ordenar alfabéticamente
        return a.nombre.localeCompare(b.nombre);
      })[0];
    },
    
    obtenerTituloEmptyState() {
      if (this.usuarioInfo && this.usuarioInfo.respuestas_registradas === 0) {
        // Respuesta específica del backend: no hay respuestas registradas
        return this.esAdmin ? 
          `${this.usuarioInfo.usuario.nombre} no ha completado el test` : 
          'Aún no has completado el test vocacional';
      }
      // Caso general: no hay datos
      return this.esAdmin ? 'Este usuario aún no ha completado el test' : 'No hay resultados disponibles';
    },
    
    obtenerDescripcionEmptyState() {
      if (this.usuarioInfo && this.usuarioInfo.respuestas_registradas === 0) {
        // Respuesta específica del backend: no hay respuestas registradas
        return this.esAdmin ? 
          'El usuario debe completar el test vocacional para ver sus resultados y recomendaciones de carrera.' : 
          'Completa nuestro test vocacional para descubrir qué carreras se adaptan mejor a tus intereses y aptitudes.';
      }
      // Caso general
      return this.esAdmin ? 'El usuario debe completar el test para ver sus resultados aquí.' : 'Aún no has completado el test vocacional';
    }
  },
  async mounted() {
    await this.cargarResultados();
  },
  methods: {
    async cargarResultados() {
      this.loading = true;
      this.error = null;
      
      try {
        let curp;
        
        if (this.esAdmin && this.usuarioCurp) {
          // Si es admin viendo resultados de otro usuario, usar el CURP pasado como prop
          curp = this.usuarioCurp;
        } else if (this.esAdmin && this.usuarioId) {
          // Fallback: Si es admin pero solo tiene usuarioId, simular CURP
          // TODO: En el futuro, esto debería obtener el CURP real del backend
          curp = `CURP${this.usuarioId}`;
        } else {
          // Si es un aspirante viendo sus propios resultados
          curp = obtenerCurpUsuario();
          
          if (!curp) {
            throw new Error('No se encontró la CURP del usuario. Por favor, inicia sesión nuevamente.');
          }
        }
        
        const response = await obtenerResultadosTest(curp);
        
        if (response.success) {
          // Si la respuesta contiene resultados del test (array)
          if (Array.isArray(response.data)) {
            this.resultados = response.data;
            this.usuarioInfo = null;
          } 
          // Si la respuesta indica que no hay respuestas registradas
          else if (response.data.respuestas_registradas === 0) {
            this.resultados = [];
            this.usuarioInfo = response.data;
          }
          // Otros casos
          else {
            this.resultados = response.data;
            this.usuarioInfo = null;
          }
        } else {
          this.error = response.message;
        }
      } catch (err) {
        this.error = err.message || 'Error inesperado al cargar los resultados';
      } finally {
        this.loading = false;
      }
    },
    
    calcularPorcentaje(tipo) {
      if (tipo.total_preguntas_materia_tipo === 0) return 0;
      return Math.round((tipo.total_respuestas_usuario / tipo.total_preguntas_materia_tipo) * 100);
    },
    
    formatearNombreMateria(nombre) {
      const nombres = {
        'salud': 'Ciencias de la Salud',
        'ingenieria': 'Ingenierías, Carreras Técnicas y Computación',
        'humanistica': 'Ciencias Humanísticas, Ciencias Jurídicas y Ciencias Sociales',
        'exactas': 'Ciencias Agrarias de la Naturaleza, Zoológicas y Biológicas',
        'economica': 'Administrativas, Contables y Económicas',
        'defensa': 'Defensa y Seguridad',
        'artistica': 'Artísticas'
      };
      return nombres[nombre] || nombre.charAt(0).toUpperCase() + nombre.slice(1);
    },

    formatearCarrerasRecomendadas(materia) {
      const carreras = {
        'economica': [
          'Administración de empresas',
          'Administración de instituciones de servicio',
          'Administración de mercados',
          'Economía y finanzas internacionales',
          'Administración de negocios',
          'Contabilidad'
        ],
        'humanistica': [
          'Sociología',
          'Psicología',
          'Antropología',
          'Trabajo Social',
          'Comunicación Social y periodismo',
          'Filosofía',
          'Ciencias políticas',
          'Derecho',
          'Ciencias forenses'
        ],
        'artistica': [
          'Música',
          'Artes plásticas',
          'Teatro',
          'Dibujo'
        ],
        'ingenieria': [
          // Ingenierías
          'Ingeniería financiera',
          'Ingeniería Industrial',
          'Ingeniería Informática',
          'Ingeniería Eléctrica',
          'Ingeniería de Mercados',
          'Ingeniería de Petróleos',
          'Ingeniería Química',
          'Ingeniería Mecánica',
          'Ingeniería de Alimentos',
          'Ingeniería Civil',
          'Ingeniería Ambiental',
          'Ingeniería Agrícola',
          'Ingeniería de Materiales',
          'Ingeniería de Telecomunicaciones',
          'Arquitectura',
          'Diseño gráfico',
          'Geología',
          // Tecnologías
          'Técnicos en enfermería',
          'Técnicos en mecánica',
          'Técnicos en contabilidad',
          'Técnicos en periodismo',
          'Técnicos en Recursos Humanos',
          'Técnico Profesional en Realización y Producción en T.V.',
          'Tecnólogo en Sistemas',
          'Tecnólogo en Gestión Financiera',
          'Tecnólogo en Salud Ocupacional'
        ],
        'defensa': [
          'Carrera militar y de policía',
          'Oficiales y suboficiales del ejército, la armada y la fuerza aérea',
          'Oficiales y suboficiales de la policía nacional'
        ],
        'exactas': [
          'Biología',
          'Zoología',
          'Zootecnia',
          'Agronomía',
          'Veterinaria'
        ],
        'salud': [
          'Medicina',
          'Enfermería',
          'Odontología',
          'Fisioterapia',
          'Nutrición y Dietética',
          'Psicología Clínica',
          'Terapia Ocupacional',
          'Fonoaudiología',
          'Optometría',
          'Bacteriología'
        ]
      };
      
      return carreras[materia] || [`Carreras relacionadas con ${this.formatearNombreMateria(materia)}`];
    },

    async generarPDF() {
      this.generandoPDF = true;
      // Selecciona solo la vista de resultados
      const el = this.$el.querySelector('.resultados-content');
      // Oculta el botón antes de exportar
      const btn = this.$el.querySelector('.pdf-btn-container');
      if (btn) btn.style.display = 'none';
      // Espera a que el botón desaparezca visualmente
      await new Promise(r => setTimeout(r, 100));
      // Carga html2pdf si no está global
      let html2pdf = window.html2pdf;
      if (!html2pdf) {
        html2pdf = (await import('html2pdf.js')).default;
      }
      await html2pdf()
        .set({
          margin: 0,
          filename: `resultados-test-vocacional-${new Date().toISOString().split('T')[0]}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: null },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all'] },
          onclone: (doc) => {
            // Importar la fuente Nunito correctamente
            const link = doc.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap';
            doc.head.appendChild(link);
            // Forzar la fuente Nunito en todo el documento
            const style = doc.createElement('style');
            style.textContent = `body, * { font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }`;
            doc.head.appendChild(style);
          }
        })
        .from(el)
        .save();
      // Restaura el botón
      if (btn) btn.style.display = '';
      this.generandoPDF = false;
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.resultados-display {
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Loading styles */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #5B3427;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 103, 31, 0.2);
  border-top: 4px solid #FF671F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error styles */
.error {
  text-align: center;
  padding: 40px 20px;
  background: rgba(255, 103, 31, 0.1);
  border: 2px solid rgba(255, 103, 31, 0.2);
  border-radius: 10px;
  margin: 20px 0;
}

.error-icon {
  margin-bottom: 15px;
  color: #FF671F;
}

.error-icon i {
  font-size: 2.5rem;
}

.retry-btn {
  background: #FF671F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.2s;
  font-weight: 600;
}

.retry-btn:hover {
  background: #5B3427;
}

/* Resumen styles */
.resumen {
    background: #FF671F;
    color: white;
    padding: 30px;
    border-radius: 8px;
    margin-bottom: 30px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(255, 103, 31, 0.15);
}

.resumen h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 18px 15px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  min-width: 140px;
  flex: 1;
  max-width: 180px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

/* Materias grid */
.materias-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

.materia-card {
  background: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e9ecef;
}

.materia-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: #FF671F;
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 103, 31, 0.2);
}

.materia-nombre {
  color: #5B3427;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.materia-icon {
  padding: 10px;
  
  border-radius: 6px;
  color: #FF671F;
  
}

.materia-icon i {
  font-size: 1.2rem;
}

.tipos-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tipo-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 10px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.tipo-item:has(.aptitud) {
  border-left-color: #FF671F;
  background: rgba(255, 103, 31, 0.05);
}

.tipo-item:has(.interes) {
  border-left-color: #5B3427;
  background: rgba(91, 52, 39, 0.05);
}

.tipo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.tipo-label {
  font-weight: 600;
  text-transform: capitalize;
  color: #5B3427;
}

.porcentaje {
  font-weight: bold;
  font-size: 1.1rem;
  color: #5B3427;
}

.porcentaje.sin-respuestas {
  color: #95a5a6;
  font-style: italic;
}

.progress-bar {
  width: 100%;
  height: 10px;
  background: rgba(255, 103, 31, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.8s ease-in-out;
  min-width: 2px;
}

.progress-fill.aptitud {
  background: #FF671F;
}

.progress-fill.interes {
  background: #5B3427;
}

.tipo-details {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.no-respuestas {
  font-style: italic;
  color: #95a5a6;
}

/* Recomendación */
.recomendacion {
  background: #ffffff;
  border: 2px solid #f8f9fa;
  padding: 32px;
  border-radius: 12px;
  margin-top: 24px;
}

.recomendacion-header {
  margin-bottom: 24px;
}

.recomendacion-header h3 {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.carrera-principal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.materia-recomendada h4 {
  color: #FF671F;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.puntuacion-badge {
  background: #f8f9fa;
  color: #5B3427;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid #e9ecef;
}

.descripcion {
  color: #6c757d;
  font-size: 0.95rem;
  margin-bottom: 20px;
  line-height: 1.5;
}

.sin-preferencias {
  color: #6c757d;
  font-style: italic;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.mensaje-reintento {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #FF671F;
  color: #495057;
  font-size: 0.9rem;
  line-height: 1.4;
}

.icono-info {
  flex-shrink: 0;
  color: #FF671F;
}

.icono-info i {
  font-size: 1rem;
}

/* Sin recomendación */
.sin-recomendacion {
  text-align: center;
  padding: 30px 20px;
  background: #fff9f5;
  border: 2px solid #ffe8d6;
  border-radius: 12px;
  margin-bottom: 20px;
}

.sin-recomendacion-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.sin-recomendacion-header i {
  font-size: 2rem;
  color: #f39c12;
}

.sin-recomendacion h4 {
  color: #d68910;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.sin-recomendacion-descripcion {
  color: #85652d;
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 20px;
}

.mensaje-sugerencia {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #f39c12;
  color: #d68910;
  font-size: 0.9rem;
  line-height: 1.4;
  max-width: 500px;
  margin: 0 auto;
}

.mensaje-sugerencia .icono-info {
  flex-shrink: 0;
  color: #f39c12;
}

/* Estilos para las carreras recomendadas */
.carreras-lista {
  margin-top: 20px;
}

.carreras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.carrera-item {
  background: #f8f9fa;
  color: #495057;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.3;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.carrera-item:hover {
  background: #e9ecef;
  border-color: #FF671F;
  color: #5B3427;
}

@media (max-width: 768px) {
  .carreras-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .carrera-item {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
  
  .carrera-principal {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .puntuacion-badge {
    align-self: flex-start;
  }
}

/* Responsive adicional */
@media (max-width: 480px) {
  .recomendacion {
    padding: 20px;
  }
  
  .materia-recomendada h4 {
    font-size: 1.25rem;
  }
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5B3427;
}

.empty-icon {
  margin-bottom: 20px;
  color: #FF671F;
}

.empty-icon i {
  font-size: 3rem;
}

.btn-primary {
  display: inline-block;
  background: #FF671F;
  color: white;
  text-decoration: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 103, 31, 0.2);
  margin-top: 20px;
}

.btn-primary:hover {
  background: #5B3427;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(91, 52, 39, 0.3);
  text-decoration: none;
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .materias-grid {
    grid-template-columns: 1fr;
  }
  
  .stats {
    flex-direction: column;
    gap: 15px;
  }
}

/* Oculta el botón PDF en impresión/pdf */
.no-print {
  display: block;
}
@media print {
  .no-print {
    display: none !important;
  }
}

/* Botón PDF discreto */
.pdf-btn-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
  padding: 0 0 0 0;
}
.btn.btn-danger {
  font-family: 'Nunito', 'Segoe UI', Arial, sans-serif;
  background: #FF671F;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1rem;
  font-weight: 600;
  box-shadow: none;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn.btn-danger:disabled {
  background: #ccc;
  color: #fff;
  cursor: not-allowed;
}
.btn.btn-danger:hover:not(:disabled) {
  background: #e55d13;
}
</style>
