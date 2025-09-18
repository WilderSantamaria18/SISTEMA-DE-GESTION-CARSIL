const express = require('express');
const router = express.Router();
const usuarioController = require('../controladores/usuarioController');
const { verificarAutenticacion } = require('../middleware/auth'); // Importar middleware de autenticación

// Aplicar middleware de autenticación a todas las rutas de usuarios
router.use('/usuarios', verificarAutenticacion);

router.get('/usuarios', usuarioController.listarUsuarios);
router.get('/usuarios/crear', usuarioController.mostrarFormularioCrear);
router.post('/usuarios/crear', usuarioController.crearUsuario);
router.get('/usuarios/editar/:id', usuarioController.mostrarFormularioEditar);
router.post('/usuarios/editar/:id', usuarioController.actualizarUsuario);
router.get('/usuarios/eliminar/:id', usuarioController.eliminarUsuario);

module.exports = router;