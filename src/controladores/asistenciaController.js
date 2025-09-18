const Asistencia = require('../modelos/Asistencia');
const Empleado = require('../modelos/Empleado');

// Mostrar lista de asistencias
exports.list = async (req, res) => {
    try {
        const asistencias = await Asistencia.getAll();
        console.log('Asistencias obtenidas:', asistencias.length);
        console.log('Primera asistencia:', asistencias[0] || 'No hay asistencias');
        
        // Asegurarse de que asistencias es un array antes de mapear
        const asistenciasFormateadas = Array.isArray(asistencias) ? asistencias.map(asistencia => ({
            ...asistencia,
            FechaFormateada: new Date(asistencia.Fecha).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            HoraEntradaFormateada: asistencia.HoraEntrada ? 
                asistencia.HoraEntrada.slice(0, 5) : '--:--',
            HoraSalidaFormateada: asistencia.HoraSalida ? 
                asistencia.HoraSalida.slice(0, 5) : '--:--'
        })) : [];

        res.render('asistencia/list', { 
            title: 'Registro de Asistencias',
            asistencias: asistenciasFormateadas,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
        
    } catch (error) {
        console.error('Error en asistenciaController.list:', error);
        
        // Verificar si el error es específico de la base de datos
        if (error.code === 'ER_NO_SUCH_TABLE') {
            req.flash('error', 'La tabla de asistencias no existe en la base de datos');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            req.flash('error', 'Error de conexión a la base de datos');
        } else {
            req.flash('error', 'Error al obtener los registros de asistencia');
        }
        
        res.render('asistencia/list', { 
            title: 'Registro de Asistencias',
            asistencias: [],
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    }
};

// Mostrar formulario para crear nueva asistencia
exports.createForm = async (req, res) => {
    try {
        const empleados = await Empleado.getAll();
        
        res.render('asistencia/create', { 
            empleados,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error('Error al cargar formulario de asistencia:', error);
        req.flash('error', 'Error al cargar formulario');
        res.redirect('/asistencia');
    }
};

// Procesar creación de nueva asistencia
exports.create = async (req, res) => {
    const { IdEmpleado, Fecha, HoraEntrada, HoraSalida, Estado, TipoAsistencia, JornadaLaboral, Observaciones } = req.body;
    
    // Validación: Si el estado es AUSENTE, requerir observación
    if (Estado === 'AUSENTE' && !Observaciones) {
        req.flash('error', 'Debe ingresar una observación cuando el estado es AUSENTE');
        return res.redirect('/asistencia/create');
    }
    
    // Validación: JornadaLaboral es requerida
    if (!JornadaLaboral) {
        req.flash('error', 'Debe seleccionar un tipo de jornada laboral');
        return res.redirect('/asistencia/create');
    }
    
    try {
        // Verificar duplicados
        const existeDuplicado = await Asistencia.checkDuplicate(IdEmpleado, Fecha);
        if (existeDuplicado) {
            req.flash('error', 'Ya existe un registro de asistencia para este empleado en la fecha seleccionada');
            return res.redirect('/asistencia/create');
        }
        
        const asistenciaData = {
            IdEmpleado,
            Fecha,
            HoraEntrada: HoraEntrada || null,
            HoraSalida: HoraSalida || null,
            Estado: Estado || 'PRESENTE',
            TipoAsistencia: TipoAsistencia || 'REGULAR',
            JornadaLaboral: JornadaLaboral || 'COMPLETA',
            Observaciones: Observaciones || null
        };
        
        // Usar el procedimiento almacenado si está disponible
        try {
            await Asistencia.registrarAsistencia(asistenciaData);
        } catch (procError) {
            // Si falla el procedimiento, usar el método create normal
            await Asistencia.create(asistenciaData);
        }
        
        req.flash('success', 'Asistencia registrada correctamente');
        res.redirect('/asistencia');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al registrar la asistencia');
        res.redirect('/asistencia/create');
    }
};

// Mostrar formulario para editar asistencia
exports.editForm = async (req, res) => {
    try {
        const asistencia = await Asistencia.getById(req.params.id);
        if (!asistencia) {
            req.flash('error', 'Asistencia no encontrada');
            return res.redirect('/asistencia');
        }
        
        const empleados = await Asistencia.getEmpleados();
        
        res.render('asistencia/edit', { 
            title: 'Editar Asistencia',
            asistencia,
            empleados,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al cargar el formulario de edición');
        res.redirect('/asistencia');
    }
};

// Procesar actualización de asistencia
exports.update = async (req, res) => {
    const { IdEmpleado, Fecha, HoraEntrada, HoraSalida, Estado, TipoAsistencia, JornadaLaboral, Observaciones } = req.body;
    const id = req.params.id;
    
    // Validación: Si el estado es AUSENTE, requerir observación
    if (Estado === 'AUSENTE' && !Observaciones) {
        req.flash('error', 'Debe ingresar una observación cuando el estado es AUSENTE');
        return res.redirect(`/asistencia/${id}/edit`);
    }
    
    try {
        // Verificar duplicados (excluyendo el registro actual)
        const existeDuplicado = await Asistencia.checkDuplicate(IdEmpleado, Fecha, id);
        if (existeDuplicado) {
            req.flash('error', 'Ya existe otro registro de asistencia para este empleado en la fecha seleccionada');
            return res.redirect(`/asistencia/${id}/edit`);
        }
        
        const asistenciaData = {
            HoraEntrada: HoraEntrada || null,
            HoraSalida: HoraSalida || null,
            Estado: Estado || 'PRESENTE',
            TipoAsistencia: TipoAsistencia || 'REGULAR',
            JornadaLaboral: JornadaLaboral || 'COMPLETA',
            Observaciones: Observaciones || null
        };
        
        const affectedRows = await Asistencia.update(id, asistenciaData);
        if (affectedRows === 0) {
            req.flash('error', 'No se pudo actualizar la asistencia');
        } else {
            req.flash('success', 'Asistencia actualizada correctamente');
        }
        res.redirect('/asistencia');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al actualizar la asistencia');
        res.redirect(`/asistencia/${id}/edit`);
    }
};

// Eliminar asistencia
exports.delete = async (req, res) => {
    try {
        const affectedRows = await Asistencia.delete(req.params.id);
        if (affectedRows === 0) {
            req.flash('error', 'No se pudo eliminar la asistencia');
        } else {
            req.flash('success', 'Asistencia eliminada correctamente');
        }
        res.redirect('/asistencia');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error al eliminar la asistencia');
        res.redirect('/asistencia');
    }
};

// Obtener horas trabajadas por empleado y rango de fechas (para integración con pagos)
exports.getHorasTrabajadasRango = async (req, res) => {
    try {
        const { IdEmpleado, fechaInicio, fechaFin } = req.query;
        
        if (!IdEmpleado || !fechaInicio || !fechaFin) {
            return res.status(400).json({ 
                error: 'Se requieren IdEmpleado, fechaInicio y fechaFin' 
            });
        }
        
        const resultado = await Asistencia.getTotalHorasTrabajadasRango(IdEmpleado, fechaInicio, fechaFin);
        
        res.json({
            success: true,
            data: resultado
        });
    } catch (error) {
        console.error('Error al obtener horas trabajadas:', error);
        res.status(500).json({ 
            error: 'Error al obtener las horas trabajadas',
            details: error.message 
        });
    }
};

// Obtener resumen semanal de asistencias
exports.getResumenSemanal = async (req, res) => {
    try {
        const { anio, semana } = req.query;
        const resumen = await Asistencia.getResumenSemanal(anio, semana);
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.json({
                success: true,
                data: resumen
            });
        } else {
            res.render('asistencia/resumen-semanal', {
                title: 'Resumen Semanal de Asistencias',
                resumen,
                anio,
                semana,
                user: req.user
            });
        }
    } catch (error) {
        console.error('Error al obtener resumen semanal:', error);
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            res.status(500).json({ 
                error: 'Error al obtener el resumen semanal' 
            });
        } else {
            req.flash('error', 'Error al obtener el resumen semanal');
            res.redirect('/asistencia');
        }
    }
};

// Función para registrar múltiples asistencias (útil para importaciones)
exports.registrarMultiple = async (req, res) => {
    try {
        const { asistencias } = req.body;
        
        if (!Array.isArray(asistencias)) {
            return res.status(400).json({
                error: 'Se requiere un array de asistencias'
            });
        }
        
        const resultados = [];
        
        for (const asistenciaData of asistencias) {
            try {
                await Asistencia.registrarAsistencia(asistenciaData);
                resultados.push({
                    empleado: asistenciaData.IdEmpleado,
                    fecha: asistenciaData.Fecha,
                    status: 'success'
                });
            } catch (error) {
                resultados.push({
                    empleado: asistenciaData.IdEmpleado,
                    fecha: asistenciaData.Fecha,
                    status: 'error',
                    message: error.message
                });
            }
        }
        
        res.json({
            success: true,
            resultados
        });
        
    } catch (error) {
        console.error('Error en registro múltiple:', error);
        res.status(500).json({
            error: 'Error al registrar las asistencias',
            details: error.message
        });
    }
};