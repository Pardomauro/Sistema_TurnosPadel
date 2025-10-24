const jwt = require('jsonwebtoken');

function generarTokenRecuperacion(usuario_id) {
  return jwt.sign({ id: usuario_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

module.exports = { generarTokenRecuperacion };