const express = require('express');
const router = express.Router();
const controladorUsuarios = require('../controllers/controladorUsuarios');

router.post('/registrar', controladorUsuarios.registro);
router.get('/:id', controladorUsuarios.getUsuario);

module.exports = router;