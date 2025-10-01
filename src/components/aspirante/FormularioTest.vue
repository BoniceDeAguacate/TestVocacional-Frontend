<template>
  <div class="formulario-test">
    <!-- Loading state -->
    <div v-if="loadingQuestions" class="loading">
      <div class="spinner"></div>
      <p>Cargando preguntas del test...</p>
    </div>

    <!-- Error loading questions -->
    <div v-else-if="errorQuestions" class="error">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar las preguntas</h3>
      <p>{{ errorQuestions }}</p>
      <button @click="cargarPreguntas" class="retry-btn">Reintentar</button>
    </div>

    <!-- Test content -->
    <template v-else-if="!showSubmitSuccess">
      <!-- Indicador de Progreso -->
      <div class="progress-container">
        <div class="progress-header">
          <h3>Página {{ currentPage }} de {{ totalPages }}</h3>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="progress-steps">
          <div 
            v-for="step in totalPages" 
            :key="step"
            class="step"
            :class="{ 
              'completed': isPageCompleted(step), 
              'current': step === currentPage,
              'pending': !isPageCompleted(step) && step !== currentPage 
            }"
            @click="goToPage(step)"
          >
            {{ step }}
          </div>
        </div>
      </div>
      
      <div class="questionnaire">
        <Transition name="page" mode="out-in">
          <div :key="currentPage" class="page-container">
            <!-- Página dinámica según la materia actual -->
            <div class="section">
              <h2>Bloque {{ currentPage }}</h2>
              <h3>Interés</h3>
              <div class="questions">
                <div v-for="(question, index) in getCurrentQuestions().interes" :key="'int-' + question.id" class="question">
                  <p>{{ question.text }}</p>
                  <div class="answer-buttons">
                    <button 
                      @click="updateAnswer(question.id, true)"
                      :class="{ active: answers[question.id] === true }"
                      class="btn-yes"
                    >
                      Sí
                    </button>
                    <button 
                      @click="updateAnswer(question.id, false)"
                      :class="{ active: answers[question.id] === false }"
                      class="btn-no"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
              
              <h3>Aptitud</h3>
              <div class="questions">
                <div v-for="(question, index) in getCurrentQuestions().aptitud" :key="'apt-' + question.id" class="question">
                  <p>{{ question.text }}</p>
                  <div class="answer-buttons">
                    <button 
                      @click="updateAnswer(question.id, true)"
                      :class="{ active: answers[question.id] === true }"
                      class="btn-yes"
                    >
                      Sí
                    </button>
                    <button 
                      @click="updateAnswer(question.id, false)"
                      :class="{ active: answers[question.id] === false }"
                      class="btn-no"
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Navegación -->
        <div class="navigation-section">
          <div class="page-info">
            <p>{{ getPageProgress() }}</p>
          </div>
          <div class="navigation-buttons">
            <button 
              @click="previousPage" 
              :disabled="currentPage === 1"
              class="btn-nav btn-previous"
            >
              Anterior
            </button>
            
            <button 
              v-if="currentPage < totalPages"
              @click="nextPage" 
              :disabled="!isCurrentPageValid()"
              :class="{ 'btn-disabled': !isCurrentPageValid() }"
              class="btn-nav btn-next"
            >
              Siguiente
            </button>
            
            <button 
              v-if="currentPage === totalPages"
              @click="submitTest" 
              :disabled="!areAllQuestionsAnswered() || submittingTest"
              :class="{ 'btn-disabled': !areAllQuestionsAnswered() || submittingTest }"
              class="btn-submit"
            >
              {{ submittingTest ? 'Enviando...' : (areAllQuestionsAnswered() ? 'Enviar Test' : 'Completa todas las preguntas') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Success state -->
    <div v-if="showSubmitSuccess" class="success-state">
      <div class="success-icon">🎉</div>
      <h2>¡Test Completado con Éxito!</h2>
      <p>Tus respuestas han sido enviadas correctamente. Ahora puedes ver tus resultados.</p>
      <button @click="goToResults" class="btn-results">Ver Mis Resultados</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  obtenerPreguntasTest, 
  enviarRespuestasTest, 
  procesarPreguntasAPI, 
  obtenerOrdenMaterias,
  obtenerNombresMaterias
} from '@/services/aspirante/testService'
import { useAlert } from '@/composables/useAlert'

const router = useRouter()
const { showError, showSuccess, showConfirm } = useAlert()

// Estados reactivos
const loadingQuestions = ref(true)
const errorQuestions = ref(null)
const submittingTest = ref(false)
const showSubmitSuccess = ref(false)

const questions = ref({})
const answers = ref({})
const currentPage = ref(1)

// Configuración de materias
const ordenMaterias = obtenerOrdenMaterias()
const nombresMaterias = obtenerNombresMaterias()
const totalPages = computed(() => ordenMaterias.length)

// Computed properties
const progressPercentage = computed(() => {
  return (currentPage.value / totalPages.value) * 100
})

const getCurrentQuestions = () => {
  const materiaActual = ordenMaterias[currentPage.value - 1]
  return questions.value[materiaActual] || { interes: [], aptitud: [] }
}

const getPageProgress = () => {
  const materiaActual = ordenMaterias[currentPage.value - 1]
  const currentQuestions = questions.value[materiaActual] || { interes: [], aptitud: [] }
  
  const totalQuestions = currentQuestions.interes.length + currentQuestions.aptitud.length
  let answeredQuestions = 0
  
  // Contar preguntas respondidas en la página actual
  currentQuestions.interes.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  currentQuestions.aptitud.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  
  return `${answeredQuestions} de ${totalQuestions} preguntas respondidas en esta sección`
}

const isCurrentPageValid = () => {
  const materiaActual = ordenMaterias[currentPage.value - 1]
  const currentQuestions = questions.value[materiaActual] || { interes: [], aptitud: [] }
  
  const totalQuestions = currentQuestions.interes.length + currentQuestions.aptitud.length
  let answeredQuestions = 0
  
  currentQuestions.interes.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  currentQuestions.aptitud.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  
  return answeredQuestions === totalQuestions
}

const isPageCompleted = (pageNumber) => {
  const materia = ordenMaterias[pageNumber - 1]
  if (!materia || !questions.value[materia]) return false
  
  const pageQuestions = questions.value[materia]
  const totalQuestions = pageQuestions.interes.length + pageQuestions.aptitud.length
  let answeredQuestions = 0
  
  pageQuestions.interes.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  pageQuestions.aptitud.forEach(q => {
    if (answers.value[q.id] !== undefined) answeredQuestions++
  })
  
  return answeredQuestions === totalQuestions
}

const areAllQuestionsAnswered = () => {
  let totalQuestions = 0
  let answeredQuestions = 0
  
  Object.values(questions.value).forEach(materia => {
    materia.interes.forEach(q => {
      totalQuestions++
      if (answers.value[q.id] !== undefined) answeredQuestions++
    })
    materia.aptitud.forEach(q => {
      totalQuestions++
      if (answers.value[q.id] !== undefined) answeredQuestions++
    })
  })
  
  return answeredQuestions === totalQuestions
}

// Funciones de navegación
const nextPage = () => {
  if (currentPage.value < totalPages.value && isCurrentPageValid()) {
    currentPage.value++
    scrollToTop()
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const goToPage = (pageNumber) => {
  if (pageNumber >= 1 && pageNumber <= totalPages.value) {
    // Permitir ir a páginas completadas o la siguiente página después de la última completada
    if (isPageCompleted(pageNumber) || pageNumber === currentPage.value) {
      currentPage.value = pageNumber
      scrollToTop()
      return
    }
    
    // Encontrar la última página completada
    let lastCompletedPage = 0
    for (let i = 1; i <= totalPages.value; i++) {
      if (isPageCompleted(i)) {
        lastCompletedPage = i
      }
    }
    
    // Permitir ir a la siguiente página después de la última completada
    if (pageNumber === lastCompletedPage + 1) {
      currentPage.value = pageNumber
      scrollToTop()
    }
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Funciones principales
const updateAnswer = (questionId, value) => {
  answers.value[questionId] = value
  saveAnswersToLocalStorage()
}

// Funciones para localStorage
const getLocalStorageKey = () => {
  const curp = localStorage.getItem('curp')
  return `test_answers_${curp}`
}

const saveAnswersToLocalStorage = () => {
  try {
    const key = getLocalStorageKey()
    localStorage.setItem(key, JSON.stringify(answers.value))
  } catch (error) {
    console.error('Error al guardar respuestas en localStorage:', error)
  }
}

const loadAnswersFromLocalStorage = () => {
  try {
    const key = getLocalStorageKey()
    const savedAnswers = localStorage.getItem(key)
    if (savedAnswers) {
      answers.value = JSON.parse(savedAnswers)
    }
  } catch (error) {
    console.error('Error al cargar respuestas desde localStorage:', error)
    answers.value = {}
  }
}

const clearAnswersFromLocalStorage = () => {
  try {
    const key = getLocalStorageKey()
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error al eliminar respuestas del localStorage:', error)
  }
}

const cargarPreguntas = async () => {
  loadingQuestions.value = true
  errorQuestions.value = null
  
  try {
    const response = await obtenerPreguntasTest()
    
    if (response.success) {
      questions.value = procesarPreguntasAPI(response.data)
      console.log('Preguntas procesadas:', questions.value)
      
      // Cargar respuestas guardadas después de cargar las preguntas
      loadAnswersFromLocalStorage()
    } else {
      errorQuestions.value = response.message
    }
  } catch (error) {
    errorQuestions.value = 'Error inesperado al cargar las preguntas'
    console.error('Error:', error)
  } finally {
    loadingQuestions.value = false
  }
}

const submitTest = async () => {
  if (!areAllQuestionsAnswered()) {
    showError('Por favor, responde todas las preguntas antes de enviar el test.', 'Test Incompleto')
    return
  }

  const result = await showConfirm(
    '¿Estás seguro de que quieres enviar el test? No podrás modificar las respuestas después.',
    'Confirmar Envío'
  )

  if (!result.isConfirmed) {
    return
  }

  submittingTest.value = true

  try {
    // Preparar las respuestas en el formato requerido por el API
    const answersArray = Object.entries(answers.value).map(([questionId, respuesta]) => ({
      id_pregunta: parseInt(questionId),
      respuesta: respuesta
    }))

    const response = await enviarRespuestasTest(answersArray)

    if (response.success) {
      showSubmitSuccess.value = true
      
      // Limpiar respuestas del localStorage al completar exitosamente
      clearAnswersFromLocalStorage()
      
      await showSuccess(
        'Tus respuestas han sido enviadas exitosamente. ¡Ya puedes ver tus resultados!',
        '🎉 ¡Test Completado!'
      )
    } else {
      showError(
        response.message || 'Error al enviar las respuestas del test',
        'Error en el Envío'
      )
    }
  } catch (error) {
    showError(
      'Error inesperado al enviar el test. Por favor, intenta nuevamente.',
      'Error de Conexión'
    )
    console.error('Error enviando test:', error)
  } finally {
    submittingTest.value = false
  }
}

const goToResults = () => {
  router.push('/aspirante/resultados')
}

// Lifecycle
onMounted(() => {
  cargarPreguntas()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

.formulario-test {
  font-family: 'Nunito', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f8f9fa;
}

/* Loading styles */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
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
  background: #ffe6e6;
  border-radius: 15px;
  margin: 20px 0;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.retry-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 15px;
  transition: background 0.3s;
  font-weight: 600;
}

.retry-btn:hover {
  background: #c0392b;
}

/* Success state */
.success-state {
  text-align: center;
  background: white;
  border-radius: 15px;
  padding: 50px 30px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
  border-top: 5px solid #28a745;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.success-state h2 {
  color: #5B3427;
  margin-bottom: 15px;
  font-size: 2rem;
}

.success-state p {
  color: #5B3427;
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.8;
}

.btn-results {
  background: linear-gradient(45deg, #28a745, #34ce57);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-results:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

/* Estilos para la paginación */
.progress-container {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
}

.progress-header {
  text-align: center;
  margin-bottom: 20px;
}

.progress-header h3 {
  color: #5B3427;
  margin: 0 0 10px 0;
  font-size: 1.3em;
  font-weight: 600;
}

.auto-save-indicator {
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.save-icon {
  font-size: 1rem;
}

.progress-bar {
  background: #f0f0f0;
  border-radius: 10px;
  height: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}

.progress-fill {
  background: linear-gradient(90deg, #FF671F 0%, #ff8f47 100%);
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease;
  box-shadow: 0 2px 8px rgba(255, 103, 31, 0.3);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid #ddd;
  background: white;
  color: #999;
  position: relative;
}

.step.completed {
  background: #FF671F;
  color: white;
  border-color: #FF671F;
  box-shadow: 0 4px 12px rgba(255, 103, 31, 0.3);
  cursor: pointer;
}

.step.completed:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(255, 103, 31, 0.4);
}

.step.current {
  background: #5B3427;
  color: white;
  border-color: #5B3427;
  box-shadow: 0 4px 12px rgba(91, 52, 39, 0.3);
  transform: scale(1.1);
  cursor: pointer;
}

.step.current:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 16px rgba(91, 52, 39, 0.4);
}

.step.pending {
  background: white;
  color: #999;
  border-color: #ddd;
  cursor: not-allowed;
  opacity: 0.6;
}

.step.completed::after {
  content: '✓';
  position: absolute;
  top: -8px;
  right: -8px;
  background: #28a745;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.step:hover:not(.pending) {
  transform: scale(1.05);
}

/* Contenedor de página con animaciones */
.page-container {
  min-height: 400px;
}

/* Animaciones de transición */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Navegación */
.navigation-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-top: 30px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
  border-bottom: 3px solid #FF671F;
}

.page-info {
  text-align: center;
  margin-bottom: 20px;
}

.page-info p {
  color: #5B3427;
  font-weight: 500;
  margin: 0;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.btn-nav {
  background: linear-gradient(45deg, #5B3427, #7a4d3d);
  color: white;
  border: none;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(91, 52, 39, 0.3);
  min-width: 120px;
}

.btn-nav:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(91, 52, 39, 0.4);
}

.btn-nav:disabled {
  background: linear-gradient(45deg, #ccc, #aaa);
  cursor: not-allowed;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

.btn-next {
  background: linear-gradient(45deg, #FF671F, #ff8f47);
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
}

.btn-next:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
}

.section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 20px rgba(91, 52, 39, 0.1);
}

.section h2 {
  color: #5B3427;
  border-bottom: 3px solid #FF671F;
  padding-bottom: 10px;
  margin-bottom: 20px;
  font-size: 1.8em;
  font-weight: 600;
}

.section h3 {
  color: #5B3427;
  margin-top: 30px;
  margin-bottom: 15px;
  font-size: 1.4em;
  font-weight: 600;
}

.question {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  box-shadow: 0 2px 10px rgba(91, 52, 39, 0.08);
  border: 1px solid rgba(255, 103, 31, 0.1);
  transition: all 0.3s ease;
}

.question:hover {
  box-shadow: 0 4px 15px rgba(91, 52, 39, 0.15);
  transform: translateY(-2px);
}

.question p {
  margin: 0 0 15px 0;
  font-weight: 500;
  color: #5B3427;
  line-height: 1.4;
}

.answer-buttons {
  display: flex;
  gap: 10px;
}

.btn-yes, .btn-no {
  padding: 10px 25px;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 14px;
  min-width: 80px;
}

.btn-yes {
  background: white;
  color: #FF671F;
  border-color: #FF671F;
}

.btn-yes.active {
  background: #FF671F;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 103, 31, 0.3);
}

.btn-no {
  background: white;
  color: #5B3427;
  border-color: #5B3427;
}

.btn-no.active {
  background: #5B3427;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(91, 52, 39, 0.3);
}

.btn-submit {
  background: linear-gradient(45deg, #FF671F, #ff8f47);
  color: white;
  border: none;
  padding: 15px 35px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 103, 31, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 103, 31, 0.4);
}

.btn-disabled {
  background: linear-gradient(45deg, #5B3427, #7a4d3d) !important;
  cursor: not-allowed !important;
  transform: none !important;
  box-shadow: 0 2px 8px rgba(91, 52, 39, 0.2) !important;
}

.btn-disabled:hover {
  transform: none !important;
  box-shadow: 0 2px 8px rgba(91, 52, 39, 0.2) !important;
}

@media (max-width: 768px) {
  .section {
    padding: 20px;
  }
  
  .answer-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .btn-yes, .btn-no {
    width: 100%;
    padding: 12px 25px;
  }
  
  .navigation-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .btn-nav {
    width: 100%;
    min-width: auto;
  }
  
  .progress-steps {
    gap: 8px;
  }
  
  .step {
    width: 35px;
    height: 35px;
    font-size: 14px;
  }
  
  .progress-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .section h2 {
    font-size: 1.5em;
  }
  
  .step {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  .progress-header h3 {
    font-size: 1.1em;
  }
}
</style>
