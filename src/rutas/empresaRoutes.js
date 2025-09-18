const express = require('express');
const router = express.Router();
const empresaController = require('../controladores/empresaController');
const { verificarAutenticacion } = require('../middleware/auth'); // Importar middleware de autenticación

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarAutenticacion);

router.get('/', empresaController.listar);
router.get('/crear', empresaController.crearForm);
router.post('/crear', empresaController.uploadMiddleware, empresaController.crear);
router.get('/editar/:id', empresaController.editarForm);
router.post('/editar/:id', empresaController.uploadMiddleware, empresaController.editar);
router.get('/eliminar/:id', empresaController.eliminar);
router.get('/logo/:id', empresaController.mostrarLogo);

module.exports = router;
