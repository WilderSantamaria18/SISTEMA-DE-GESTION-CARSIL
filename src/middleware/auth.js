// Middleware para verificar si el usuario está autenticado
exports.verificarAutenticacion = (req, res, next) => {
    // Comprueba si el usuario está logueado (si existe una sesión de usuario)
    if (req.session && req.session.usuario) {
        // Si está autenticado, guarda el usuario en req.user para usarlo en las vistas
        req.user = req.session.usuario;
        return next();
    }
    
    // Si la ruta es del login o recuperación de contraseña, permitir acceso
    if (req.path === '/login' || req.path.startsWith('/recuperar')) {
        return next();
    }
    
    // Si no está autenticado, redirigir al login
    req.flash('error', 'Debe iniciar sesión para acceder a esta página');
    return res.redirect('/login');
};
