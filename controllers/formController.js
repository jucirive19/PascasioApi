const connection = require('../config/db');
//enviar formulario desde nuestro frontend "ayuda.jsx" a nuestra base de datos 
const enviarFormulario = (req, res) => {
  const { registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud } = req.body;

  // Validar que venga el registro_id
  if (!registro_id) {
    return res.status(400).json({ 
      success: false,
      message: 'El registro_id es requerido' 
    });
  }

  const sql = 'INSERT INTO formularios (registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  connection.query(sql, [registro_id, name, descripcion, confi, otroConfi, colegio, mensaje, latitud, longitud], (err, result) => {
    if (err) {
      console.error('Error al insertar los datos:', err);
      res.status(500).json({ 
        success: false,
        message: 'Error al insertar los datos',
        error: err.message
      });
    } else {
      res.status(200).json({ 
        success: true,
        message: 'Formulario enviado exitosamente 🤗',
        formulario_id: result.insertId
      });
    }
  });
};

const registrarUsuario = (req, res) => {
  const { username } = req.body;
  
  // Validar que venga el username
  if (!username || username.trim() === '') {
    return res.status(400).json({ 
      success: false,
      message: 'El username es requerido' 
    });
  }

  // Validar longitud del username
  if (username.length > 255) {
    return res.status(400).json({ 
      success: false,
      message: 'El username no puede exceder 255 caracteres' 
    });
  }
  
  // SQL para insertar en la tabla registros
  const sql = 'INSERT INTO registros (username) VALUES (?)';
  
  connection.query(sql, [username.trim()], (err, result) => {
    if (err) {
      console.error('Error al registrar usuario:', err);
      
      // Manejar error de username duplicado
      if (err.code === 'ER_DUP_ENTRY') {
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
    } else {
      //  Aquí está la clave: devolver el insertId
      res.status(200).json({ 
        success: true,
        message: `Usuario ${username} registrado exitosamente`,
        username: username,
        userId: result.insertId  // Este es el ID que necesitas
      });
    }
  });
};

const obtenerPreguntas = (req, res) => {
  // SQL simplificado - obtener TODAS las preguntas con sus opciones
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

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error al obtener preguntas:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error al obtener las preguntas',
        error: err.message
      });
    }

    // Organizar los resultados agrupando opciones por pregunta
    const preguntasMap = {};
    
    results.forEach(row => {
      if (!preguntasMap[row.pregunta_id]) {
        preguntasMap[row.pregunta_id] = {
          id: row.pregunta_id,
          texto: row.pregunta_texto,
          tipo: row.tipo,
          obligatorio: row.obligatorio === 1,
          es_sensible: row.es_sensible === 1,
          genera_alerta: row.genera_alerta === 1,
          orden: row.pregunta_orden,
          opciones: []
        };
      }
      
      // Agregar la opción si existe
      if (row.opcion_id) {
        preguntasMap[row.pregunta_id].opciones.push({
          id: row.opcion_id,
          texto: row.opcion_texto,
          valor: row.opcion_valor,
          orden: row.opcion_orden
        });
      }
    });

    // Convertir el map a array y ordenar por orden
    const preguntas = Object.values(preguntasMap).sort((a, b) => a.orden - b.orden);

    res.status(200).json({ 
      success: true,
      preguntas: preguntas,
      total: preguntas.length
    });
  });
};

const guardarRespuestas = (req, res) => {
  const { registro_id, respuestas } = req.body;
  
  // Validar que vengan los datos necesarios
  if (!registro_id || !respuestas || !Array.isArray(respuestas) || respuestas.length === 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Faltan datos requeridos: registro_id y respuestas[]' 
    });
  }

  // Validar que cada respuesta tenga al menos pregunta_id
  for (let i = 0; i < respuestas.length; i++) {
    const respuesta = respuestas[i];
    if (!respuesta.pregunta_id) {
      return res.status(400).json({ 
        success: false,
        message: `La respuesta en la posición ${i} debe tener pregunta_id` 
      });
    }
  }

  // Preparar los valores para inserción múltiple
  // respuestas debe ser un array de objetos: 
  // [{ pregunta_id, opcion_id, respuesta_text }, ...]
  const valores = respuestas.map(r => [
    registro_id,
    r.pregunta_id,
    r.opcion_id || null,
    r.respuesta_text || null
  ]);

  // Crear placeholders para inserción múltiple
  const placeholders = valores.map(() => '(?, ?, ?, ?)').join(', ');
  
  // SQL para insertar múltiples respuestas
  const sql = `
    INSERT INTO respuestas (registro_id, pregunta_id, opcion_id, respuesta_text) 
    VALUES ${placeholders}
  `;

  // Aplanar el array de valores para la consulta
  const valoresAplanados = valores.flat();

  connection.query(sql, valoresAplanados, (err, result) => {
    if (err) {
      console.error('Error al guardar respuestas:', err);
      return res.status(500).json({ 
        success: false,
        message: 'Error al guardar las respuestas en la base de datos',
        error: err.message
      });
    }
    
    res.status(200).json({ 
      success: true,
      message: 'Respuestas guardadas exitosamente',
      respuestas_guardadas: result.affectedRows,
      registro_id: registro_id
    });
  });
};

module.exports = { enviarFormulario, registrarUsuario, obtenerPreguntas, guardarRespuestas };