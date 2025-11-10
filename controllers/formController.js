const supabase = require('../config/db');

// Enviar formulario
const enviarFormulario = async (req, res) => {
  const { registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud } = req.body;

  if (!registro_id) {
    return res.status(400).json({ 
      success: false,
      message: 'El registro_id es requerido' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('formularios')
      .insert([{
        registro_id,
        name,
        descripcion,
        confi,
        otroConfi,
        colegio,
        mensaje,
        latitud,
        longitud
      }])
      .select();

    if (error) throw error;

    res.status(200).json({ 
      success: true,
      message: 'Formulario enviado exitosamente 🤗',
      formulario_id: data[0].id
    });
  } catch (err) {
    console.error('Error al insertar los datos:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al insertar los datos',
      error: err.message
    });
  }
};

// Registrar usuario
const registrarUsuario = async (req, res) => {
  const { username } = req.body;
  
  if (!username || username.trim() === '') {
    return res.status(400).json({ 
      success: false,
      message: 'El username es requerido' 
    });
  }

  if (username.length > 255) {
    return res.status(400).json({ 
      success: false,
      message: 'El username no puede exceder 255 caracteres' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('registros')
      .insert([{ username: username.trim() }])
      .select();

    if (error) {
      // Manejar error de username duplicado
      if (error.code === '23505') {
        return res.status(409).json({ 
          success: false,
          message: 'El username ya existe. Por favor, elige otro username.' 
        });
      }
      throw error;
    }

    res.status(200).json({ 
      success: true,
      message: `Usuario ${username} registrado exitosamente`,
      username: data[0].username,
      userId: data[0].id
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar el usuario en la base de datos',
      error: err.message
    });
  }
};

// Obtener preguntas
const obtenerPreguntas = async (req, res) => {
  try {
    // Obtener todas las preguntas
    const { data: preguntas, error: preguntasError } = await supabase
      .from('preguntas')
      .select('*')
      .order('orden');

    if (preguntasError) throw preguntasError;

    // Obtener todas las opciones
    const { data: opciones, error: opcionesError } = await supabase
      .from('opciones')
      .select('*')
      .order('orden');

    if (opcionesError) throw opcionesError;

    // Agrupar opciones por pregunta
    const preguntasConOpciones = preguntas.map(pregunta => ({
      ...pregunta,
      opciones: opciones.filter(opcion => opcion.pregunta_id === pregunta.id)
    }));

    res.status(200).json({ 
      success: true,
      preguntas: preguntasConOpciones,
      total: preguntasConOpciones.length
    });
  } catch (err) {
    console.error('Error al obtener preguntas:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener las preguntas',
      error: err.message
    });
  }
};

// Guardar respuestas
const guardarRespuestas = async (req, res) => {
  const { registro_id, respuestas } = req.body;
  
  if (!registro_id || !respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Faltan datos requeridos: registro_id y respuestas[]' 
    });
  }

  for (let i = 0; i < respuestas.length; i++) {
    const respuesta = respuestas[i];
    if (!respuesta.pregunta_id) {
      return res.status(400).json({ 
        success: false,
        message: `La respuesta en la posición ${i} debe tener pregunta_id` 
      });
    }
  }

  // Preparar datos para inserción
  const respuestasParaInsertar = respuestas.map(r => ({
    registro_id,
    pregunta_id: r.pregunta_id,
    opcion_id: r.opcion_id || null,
    respuesta_text: r.respuesta_text || null
  }));

  try {
    const { data, error } = await supabase
      .from('respuestas')
      .insert(respuestasParaInsertar)
      .select();

    if (error) throw error;

    res.status(200).json({ 
      success: true,
      message: 'Respuestas guardadas exitosamente',
      respuestas_guardadas: data.length,
      registro_id: registro_id
    });
  } catch (err) {
    console.error('Error al guardar respuestas:', err);
    res.status(500).json({ 
      success: false,
      message: 'Error al guardar las respuestas en la base de datos',
      error: err.message
    });
  }
};

module.exports = { enviarFormulario, registrarUsuario, obtenerPreguntas, guardarRespuestas };