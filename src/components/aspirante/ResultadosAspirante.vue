<template>
  <div class="resultados-container">
    <!-- Header -->
    <div class="header">
      <h2 class="title">Resultados del Test Vocacional</h2>
      <p class="subtitle">Aquí puedes ver tus resultados organizados por materia</p>
    </div>

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
            <span class="stat-label">Respuestas Totales</span>
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
                <span class="porcentaje">{{ calcularPorcentaje(tipo) }}%</span>
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
        <h3>🎯 Materia Recomendada</h3>
        <div class="materia-recomendada">
          <h4>{{ formatearNombreMateria(materiaRecomendada.nombre) }}</h4>
          <p>Basado en tu mayor puntuación combinada de aptitud e interés</p>
          <div class="puntuacion-total">
            Puntuación: {{ materiaRecomendada.puntuacion }}%
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>No hay resultados disponibles</h3>
      <p>Aún no has completado el test vocacional</p>
    </div>
  </div>
</template>

<script>
import { obtenerResultadosTest, obtenerCurpUsuario } from '../../services/aspirante/aspiranteService';

export default {
  name: 'ResultadosAspirante',
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
        
        materia.tipos.forEach(tipo => {
          const porcentaje = this.calcularPorcentaje(tipo);
          puntuacionTotal += porcentaje;
          totalPreguntas += tipo.total_preguntas_materia_tipo;
        });
        
        puntuacionesPorMateria[materia.nombre] = {
          nombre: materia.nombre,
          puntuacion: Math.round(puntuacionTotal / materia.tipos.length)
        };
      });
      
      return Object.values(puntuacionesPorMateria)
        .sort((a, b) => b.puntuacion - a.puntuacion)[0] || { nombre: '', puntuacion: 0 };
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
        const curp = obtenerCurpUsuario();
        
        if (!curp) {
          throw new Error('No se encontró la CURP del usuario. Por favor, inicia sesión nuevamente.');
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
    }
  }
};
</script>

<style scoped>
.resultados-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 600;
}

.subtitle {
  color: #7f8c8d;
  font-size: 1.1rem;
}

/* Loading styles */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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
  background: #ffe6e6;
  border-radius: 10px;
  margin: 20px 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.retry-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #c0392b;
}

/* Resumen styles */
.resumen {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.resumen h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.stats {
  display: flex;
  gap: 30px;
  justify-content: center;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 10px;
  backdrop-filter: blur(10px);
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
}

.materia-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
}

.materia-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ecf0f1;
}

.materia-nombre {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
}

.materia-icon {
  font-size: 1.5rem;
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
}

.tipo-item:has(.aptitud) {
  border-left-color: #3498db;
}

.tipo-item:has(.interes) {
  border-left-color: #e74c3c;
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
  color: #34495e;
}

.porcentaje {
  font-weight: bold;
  font-size: 1.1rem;
  color: #2c3e50;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease-in-out;
}

.progress-fill.aptitud {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

.progress-fill.interes {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.tipo-details {
  font-size: 0.9rem;
  color: #7f8c8d;
}

/* Recomendación */
.recomendacion {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
}

.recomendacion h3 {
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.materia-recomendada h4 {
  font-size: 1.8rem;
  margin-bottom: 10px;
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
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
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
  
  .title {
    font-size: 2rem;
  }
  
  .resultados-container {
    padding: 15px;
  }
}
</style>
