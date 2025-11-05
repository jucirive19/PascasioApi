const pool = require('../config/db');

// Enviar formulario
const enviarFormulario = async (req, res) => {
  const { registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud } = req.body;

  if (!registro_id) {
    return res.status(400).json({ 
      success: false,
      message: 'El registro_id es requerido' 
    });
  }

  const sql = 'INSERT INTO formularios (registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id';

  try {
    const result = await pool.query(sql, [registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud]);
    res.status(200).json({ 
      success: true,
      message: 'Formulario enviado exitosamente 🤗',
      formulario_id: result.rows[0].id
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
  
  const sql = 'INSERT INTO registros (username) VALUES ($1) RETURNING id, username';
  
  try {
    const result = await pool.query(sql, [username.trim()]);
    res.status(200).json({ 
      success: true,
      message: `Usuario ${username} registrado exitosamente`,
      username: result.rows[0].username,
      userId: result.rows[0].id
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    
    // Manejar error de username duplicado (código diferente en PostgreSQL)
    if (err.code === '23505') {
      return res.status(409).json({ 
        success: false,
        message: 'El username ya existe. Por favor, elige otro username.' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar el usuario en la base de datos',
      error: err.message
    });
  }
};

// Obtener preguntas
const obtenerPreguntas = async (req, res) => {
  const sql = `
    SELECT 
      p.id as pregunta_id,
      p.texto as pregunta_texto,
      p.tipo,
      p.obligatorio,
      p.es_sensible,
      p.genera_alerta,
      p.orden as pregunta_orden,
      o.id as opcion_id,
      o.texto as opcion_texto,
      o.valor as opcion_valor,
      o.orden as opcion_orden
    FROM preguntas p
    LEFT JOIN opciones o ON p.id = o.pregunta_id
    ORDER BY p.orden, o.orden
  `;

  try {
    const result = await pool.query(sql);
    const preguntasMap = {};
    
    result.rows.forEach(row => {
      if (!preguntasMap[row.pregunta_id]) {
        preguntasMap[row.pregunta_id] = {
          id: row.pregunta_id,
          texto: row.pregunta_texto,
          tipo: row.tipo,
          obligatorio: row.obligatorio,
          es_sensible: row.es_sensible,
          genera_alerta: row.genera_alerta,
          orden: row.pregunta_orden,
          opciones: []
        };
      }
      
      if (row.opcion_id) {
        preguntasMap[row.pregunta_id].opciones.push({
          id: row.opcion_id,
          texto: row.opcion_texto,
          valor: row.opcion_valor,
          orden: row.opcion_orden
        });
      }
    });

    const preguntas = Object.values(preguntasMap).sort((a, b) => a.orden - b.orden);

    res.status(200).json({ 
      success: true,
      preguntas: preguntas,
      total: preguntas.length
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

  // Preparar valores para inserción múltiple
  const valores = respuestas.map(r => [
    registro_id,
    r.pregunta_id,
    r.opcion_id || null,
    r.respuesta_text || null
  ]);

  // Crear placeholders para PostgreSQL ($1, $2, $3, etc.)
  let paramIndex = 1;
  const placeholders = valores.map(() => {
    const placeholder = `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3})`;
    paramIndex += 4;
    return placeholder;
  }).join(', ');
  
  const sql = `
    INSERT INTO respuestas (registro_id, pregunta_id, opcion_id, respuesta_text) 
    VALUES ${placeholders}
  `;

  const valoresAplanados = valores.flat();

  try {
    const result = await pool.query(sql, valoresAplanados);
    res.status(200).json({ 
      success: true,
      message: 'Respuestas guardadas exitosamente',
      respuestas_guardadas: result.rowCount,
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