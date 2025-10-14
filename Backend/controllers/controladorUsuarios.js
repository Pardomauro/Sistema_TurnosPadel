const usuario = require('../models/modeloUsuarios');

exports.registro = async (req, res) => {
    try {
        const { nombre, email, contraseña } = req.body;
        const userId = await User.create({ nombre, email, contraseña });
        res.status(201).json({ id: userId, nombre, email });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

exports.getUsuario = async (req, res) => {
    try {
        const usuario = await User.findById(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};