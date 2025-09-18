const express = require('express');
const router = express.Router();
const menuControlador = require('../controladores/menuControlador');
const { verificarAutenticacion } = require('../middleware/auth'); // Importar middleware de autenticación

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

// Ruta para /menu
router.get('/menu', menuControlador.mostrarMenu);

// Ruta para /menu/principal
router.get('/menu/principal', menuControlador.mostrarMenu);

module.exports = router;