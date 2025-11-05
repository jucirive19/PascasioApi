// routes/formRoutes.js
const express = require('express');
const router = express.Router();
const { enviarFormulario, registrarUsuario, obtenerPreguntas, guardarRespuestas } = require('../controllers/formController');

// Ahora las rutas serán relativas a /api/form
router.post('/enviar', enviarFormulario);
router.post('/registrar', registrarUsuario);
router.get('/obtener-preguntas', obtenerPreguntas);
router.post('/guardar-respuestas', guardarRespuestas); 


module.exports = router;