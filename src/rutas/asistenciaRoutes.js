const express = require('express');
const router = express.Router();
const asistenciaController = require('../controladores/asistenciaController');
const { verificarAutenticacion } = require('../middleware/auth'); // Importar middleware de autenticación

// Aplicar middleware de autenticación a todas las rutas de asistencia
router.use('/asistencia', verificarAutenticacion);

// Rutas principales de asistencia
router.get('/asistencia', asistenciaController.list);
router.get('/asistencia/create', asistenciaController.createForm);
router.post('/asistencia', asistenciaController.create);
router.get('/asistencia/:id/edit', asistenciaController.editForm);
router.post('/asistencia/:id', asistenciaController.update);
router.post('/asistencia/:id/delete', asistenciaController.delete);

// Rutas adicionales para reportes e integración
router.get('/asistencia/resumen-semanal', asistenciaController.getResumenSemanal);
router.get('/api/asistencia/horas-trabajadas', asistenciaController.getHorasTrabajadasRango);
router.post('/api/asistencia/registrar-multiple', asistenciaController.registrarMultiple);

module.exports = router;