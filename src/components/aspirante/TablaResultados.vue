<template>
  <div class="resultados-display">
    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Cargando resultados...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error"> 
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar los resultados</h3>
      <p>{{ error }}</p>
      <button @click="cargarResultados" class="retry-btn">Reintentar</button>
    </div>

    <!-- Results content -->
    <div v-else-if="resultados.length > 0" class="resultados-content">
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
            <div class="materia-icon">📚</div>
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
        <h3>🎯 Carreras recomendadas</h3>
        <div class="materia-recomendada">
          <h4>{{ formatearNombreMateria(materiaRecomendada.nombre) }}</h4>
          <p v-if="materiaRecomendada.puntuacion > 0">
            Basado en tu mayor puntuación combinada de aptitud e interés
          </p>
          <p v-else class="sin-preferencias">
            No se encontraron preferencias marcadas. Te recomendamos realizar el test nuevamente respondiendo según tus verdaderos intereses.
          </p>
          
          <!-- Lista de carreras específicas -->
          <div v-if="materiaRecomendada.puntuacion > 0" class="carreras-lista">
            <h5>Carreras sugeridas:</h5>
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
          
          <div class="puntuacion-total" v-if="materiaRecomendada.puntuacion > 0">
            Puntuación: {{ materiaRecomendada.puntuacion }}%
          </div>
          <div class="mensaje-reintento" v-else>
            <p>💡 Consejo: Responde "Sí" a las actividades que realmente te gustan o en las que te sientes hábil.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>{{ esAdmin ? 'Este usuario aún no ha completado el test' : 'No hay resultados disponibles' }}</h3>
      <p>{{ esAdmin ? 'El usuario debe completar el test para ver sus resultados aquí.' : 'Aún no has completado el test vocacional' }}</p>
      <router-link v-if="!esAdmin" to="/aspirante/test" class="btn-primary">
        Realizar Test Vocacional
      </router-link>
    </div>
  </div>
</template>

<script>
import { obtenerResultadosTest, obtenerCurpUsuario } from '../../services/aspirante/aspiranteService';

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
      loading: true,
      error: null
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
      
      // Si no hay materias con respuestas positivas, retornar la primera con mayor puntuación total
      if (materias.length === 0) {
        const todasMaterias = this.materiasAgrupadas.map(materia => {
          let puntuacionTotal = 0;
          materia.tipos.forEach(tipo => {
            puntuacionTotal += this.calcularPorcentaje(tipo);
          });
          return {
            nombre: materia.nombre,
            puntuacion: Math.round(puntuacionTotal / materia.tipos.length)
          };
        });
        
        return todasMaterias.sort((a, b) => b.puntuacion - a.puntuacion)[0] || { nombre: 'No disponible', puntuacion: 0 };
      }
      
      return materias.sort((a, b) => b.puntuacion - a.puntuacion)[0];
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
          this.resultados = response.data;
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
        'ingenieria': 'Ingeniería',
        'humanistica': 'Ciencias Humanísticas',
        'exactas': 'Ciencias Exactas',
        'economica': 'Ciencias Económicas',
        'defensa': 'Defensa y Seguridad',
        'artistica': 'Artes y Humanidades'
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
  font-size: 3rem;
  margin-bottom: 15px;
  color: #FF671F;
}

.retry-btn {
  background: #FF671F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
  font-weight: 600;
}

.retry-btn:hover {
  background: #e55a1a;
}

/* Resumen styles */
.resumen {
    background: linear-gradient(135deg, #FF671F 0%, #5B3427 100%);
    color: white;
    padding: 30px;
    border-radius: 15px;
    margin-bottom: 30px;
    text-align: center;
    box-shadow: 0 8px 25px rgba(255, 103, 31, 0.3);
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
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid rgba(255, 103, 31, 0.1);
}

.materia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(255, 103, 31, 0.2);
  border-color: rgba(255, 103, 31, 0.3);
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
  font-size: 1.5rem;
  padding: 8px;
  background: rgba(255, 103, 31, 0.1);
  border-radius: 50%;
  color: #FF671F;
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
  background: linear-gradient(90deg, #FF671F, #e55a1a);
}

.progress-fill.interes {
  background: linear-gradient(90deg, #5B3427, #4a2a1f);
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
  background: linear-gradient(135deg, #FF671F 0%, #5B3427 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(255, 103, 31, 0.3);
}

.recomendacion h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.materia-recomendada h4 {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.sin-preferencias {
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  margin-bottom: 15px;
}

.mensaje-reintento {
  background: rgba(255, 255, 255, 0.15);
  padding: 15px;
  border-radius: 10px;
  margin-top: 15px;
}

.mensaje-reintento p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Estilos para las carreras recomendadas */
.carreras-lista {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.carreras-lista h4 {
  color: #FFE0D0;
  font-size: 1.3rem;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
}

.carreras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.carrera-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #FFE0D0;
  font-size: 0.9rem;
  line-height: 1.3;
  transition: all 0.3s ease;
}

.carrera-item:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 103, 31, 0.2);
}

@media (max-width: 768px) {
  .carreras-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .carrera-item {
    font-size: 0.85rem;
    padding: 10px 12px;
  }
  
  .carreras-lista h4 {
    font-size: 1.1rem;
  }
}

.puntuacion-total {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 15px;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #5B3427;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  color: #FF671F;
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
  margin-top: 20px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
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
</style>
