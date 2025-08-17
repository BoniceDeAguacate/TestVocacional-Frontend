import api from '../api'

// Obtener todas las preguntas del test
export const obtenerPreguntasTest = async () => {
  try {
    const response = await api.get('/preguntas/')
    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error al obtener preguntas:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Error al cargar las preguntas del test'
    }
  }
}

// Enviar respuestas del test
export const enviarRespuestasTest = async (answers) => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) {
      throw new Error('No se encontró el token de autenticación')
    }

    const response = await api.post('/resultados/submit', {
      answers
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error al enviar respuestas:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Error al enviar las respuestas del test'
    }
  }
}

// Procesar preguntas del API para organizarlas por materia
export const procesarPreguntasAPI = (preguntasAPI) => {
  const preguntasPorMateria = {}
  
  preguntasAPI.forEach(pregunta => {
    const nombreMateria = pregunta.nombre_materia
    const tipoTexto = pregunta.tipo_texto
    
    if (!preguntasPorMateria[nombreMateria]) {
      preguntasPorMateria[nombreMateria] = {
        interes: [],
        aptitud: []
      }
    }
    
    preguntasPorMateria[nombreMateria][tipoTexto].push({
      id: pregunta.id,
      text: pregunta.pregunta,
      id_materia: pregunta.id_materia,
      tipo: pregunta.tipo
    })
  })
  
  return preguntasPorMateria
}

// Mapeo de nombres de materias para el orden de páginas
export const obtenerOrdenMaterias = () => {
  return [
    'economica',
    'humanistica', 
    'artistica',
    'salud',
    'ingenieria',
    'defensa',
    'exactas'
  ]
}

// Obtener nombres legibles de las materias
export const obtenerNombresMaterias = () => {
  return {
    economica: 'Administrativas, Contables y Económicas',
    humanistica: 'Humanísticas, Ciencias Jurídicas y Ciencias Sociales',
    artistica: 'Artísticas',
    salud: 'Ciencias de la Salud',
    ingenieria: 'Ingenierías, Carreras Técnicas y Computación',
    defensa: 'Defensa y Seguridad',
    exactas: 'Ciencias Agrarias de la Naturaleza, Zoológicas y Biológicas'
  }
}
