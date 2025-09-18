const Usuario = require('../modelos/Usuario');

exports.mostrarLogin = (req, res) => {
    res.render('login/login', { error: null });
};

exports.procesarLogin = async (req, res) => {
    const { correo, clave } = req.body;
    try {
        const usuario = await Usuario.autenticar(correo, clave);
        if (usuario) {
            req.session.usuario = usuario; // Guardar usuario en la sesión
            return res.redirect('/menu'); // Redirigir al menú principal
        } else {
            res.render('login/login', { error: 'Correo o contraseña incorrectos.' });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        res.render('login/login', { error: 'Error interno del servidor.' });
    }
};

exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login'); // Redirigir al login
    });
};