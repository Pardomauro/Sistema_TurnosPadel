import express from 'express';
import { body, param, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../Config/db.js';
import { enviarCorreo } from '../Servicios/EmailServicio.js';
import { generarToken, verificarToken, protegerRuta, verificarRol } from '../Servicios/token.js';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors.js';

const router = express.Router();

// Middleware de validación
const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errores.array()
        });
    }
    next();
};

// Ruta para obtener todos los usuarios

router.get('/usuarios', [
    protegerRuta,
    verificarRol(['administrador'])
], async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT 
            id_usuario, 
            nombre,  
            email 
            FROM usuarios
            ORDER BY id ASC
    `);

        res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos correctamente',
            data: rows,
            total: rows.length

        });


    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener los usuarios',
            error: error.message
        });
    }
});


// Obtenemos usuario específico por su ID

router.get('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario inválido'
            });
        }

        const [rows] = await pool.query(`SELECT 
            id_usuario, 
            nombre, 
            email 
            FROM usuarios 
            WHERE id_usuario = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario obtenido correctamente',
            data: rows[0]
        });

    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener el usuario',
            error: error.message
        });
    }
});


// Función para validar el formato del email

const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);

};


// Ruta para "registrar" un nuevo usuario (crear cuenta)

router.post('/usuarios/registrar', [
    body('nombre')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula'),
    validarCampos
], async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        // Validar que se proporcionen los campos necesarios
        if (!nombre || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar formato del email

        if(!validarEmail(email)){
            return res.status(400).json({
                success: false,
                message: 'El formato del email no es válido'
            });
        }

        // Verificar si el usuario existe
        const [usuarioExistente] = await pool.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [email.toLowerCase()]
        );
        
        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Hashear la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar el nuevo usuario en la base de datos 
        const [resultado] = await pool.execute(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre.trim(), email.toLowerCase(), hashedPassword]
        );

        // Obtener datos del usuario creado sin su contraseña
        const [nuevoUsuario] = await pool.execute(
            'SELECT id_usuario, nombre, email FROM usuarios WHERE id_usuario = ?',
            [resultado.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Usuario creado correctamente',
            user: nuevoUsuario[0]
        });



    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al crear el usuario',
            error: error.message
        });
    }
});



// Ruta para login de usuario (iniciar sesión)
router.post('/usuarios/login', [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    validarCampos
], async (req, res) => {
    try{
        const { email, password } = req.body;

        // Validar campos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario por email
        const [usuarios] = await pool.execute(
            'SELECT id_usuario, nombre, email, password FROM usuarios WHERE email = ?',
            [email.toLowerCase()]
        ); 

        if (usuarios.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        
        }

        const usuario = usuarios[0];

        // Comparar contraseñas 
        const passwordMatch = await bcrypt.compare(password, usuario.password);

        if (!passwordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña incorrecta'
                
            });
        }

        // Remover la contraseña antes de enviar la respuesta
        const { password: _, ...usuarioSinPassword } = usuario;

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: usuarioSinPassword
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al iniciar sesión',
            error: error.message
        });
    }
});
 


// Ruta para actualizar un usuario existente
router.put('/usuarios/:id', [
    protegerRuta,
    param('id').isInt().withMessage('ID de usuario inválido'),
    body('nombre')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula'),
    validarCampos
], async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password } = req.body;

        // Verificar que el usuario exista
        const [usuarioExistente] = await pool.execute(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
            [id]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Validar los campos proporcionados
        if (!nombre || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y email son obligatorios'
            });
        }

        // Validar formato de email
        if (!validarEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'El formato del email no es válido'
            });
        }

        // Verificar si el nuevo email ya está en uso por otro usuario
        const [usuario] = await pool.execute(
            'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
            [email.toLowerCase(), id]
        );

        if (usuario.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está en uso por otro usuario'
            });
        }

        // Construir la consulta de actualización
        let actualizarConsulta = 'UPDATE usuarios SET nombre = ?, email = ?';
        const actualizarParametros = [nombre.trim(), email.toLowerCase()];

        // Verificar si se proporciona una nueva contraseña
        if (password) {
            // Validar la nueva contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Hashear la nueva contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            actualizarConsulta += ', password = ?';
            actualizarParametros.push(hashedPassword);
        }

        actualizarConsulta += ' WHERE id_usuario = ?';
        actualizarParametros.push(id);

        // Ejecutar la consulta de actualización
        await pool.execute(actualizarConsulta, actualizarParametros);

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al actualizar usuario',
            error: error.message
        }); 
    }
});
 
 
// Ruta para eliminar un usuario   
router.delete('/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params; // Corregido: Extraer correctamente el parámetro

        // Verificar que el usuario exista
        const [usuarios] = await pool.execute(
            'SELECT * FROM usuarios WHERE id_usuario = ?', [id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminamos el usuario de la base de datos
        await pool.execute(
            'DELETE FROM usuarios WHERE id_usuario = ?', [id]
        );

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al eliminar usuario',
            error: error.message
        });
    }
});


// Ruta para recuperación de contraseña


router.post('/recuperar-contrasena', [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    validarCampos
], async (req, res) => {
  try {
    const { email } = req.body;

    // Verificar si el correo existe en la base de datos
    const [usuario] = await pool.execute(
      'SELECT id_usuario, nombre, email FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const usuarioEncontrado = usuario[0];

    // Generar un token de recuperación
    const token = generarTokenRecuperacion(usuarioEncontrado.id_usuario);

    // Enviar correo con el enlace de recuperación
    const enlaceRecuperacion = `https://tu-dominio.com/recuperar-contrasena?token=${token}`;
    await enviarCorreo({
      destinatario: email,
      asunto: 'Recuperación de Contraseña',
      contenidoHTML: `
        <h1>Recuperación de Contraseña</h1>
        <p>Hola ${usuarioEncontrado.nombre},</p>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Puedes restablecerla haciendo clic en el siguiente enlace:</p>
        <a href="${enlaceRecuperacion}">Restablecer Contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
      `,
    });

    res.status(200).json({ success: true, message: 'Correo de recuperación enviado.' });
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    res.status(500).json({ success: false, message: 'Error interno al enviar el correo de recuperación.' });
  }
});



// Ruta para restablecer contraseña


router.post('/restablecer-contrasena', [
    body('token')
        .notEmpty()
        .withMessage('El token es requerido'),
    body('nuevaContrasena')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/\d/)
        .withMessage('La contraseña debe contener al menos un número')
        .matches(/[A-Z]/)
        .withMessage('La contraseña debe contener al menos una mayúscula'),
    validarCampos
], async (req, res) => {
  try {
    const { token, nuevaContrasena } = req.body;

    // Validar que se proporcionen los campos necesarios
    if (!token || !nuevaContrasena) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son obligatorios'
      });
    }

    // Validar la nueva contraseña
    if (nuevaContrasena.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Validar el token de recuperación
    let id_usuario;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      id_usuario = decoded.id;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar que el usuario existe
    const [usuario] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Hashear la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nuevaContrasena, saltRounds);

    // Actualizar la contraseña en la base de datos
    await pool.execute(
      'UPDATE usuarios SET password = ? WHERE id_usuario = ?',
      [hashedPassword, id_usuario]
    );

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al restablecer contraseña',
      error: error.message
    });
  }
});

// Ruta para validar el token de recuperación
router.post('/validar-token-recuperacion', [
    body('token')
        .notEmpty()
        .withMessage('El token es requerido'),
    validarCampos
], async (req, res) => {
  try {
    const { token } = req.body;

    // Validar que se proporcione el token
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token es obligatorio'
      });
    }

    // Validar el token de recuperación
    let id_usuario;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      id_usuario = decoded.id;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Verificar que el usuario existe
    const [usuario] = await pool.execute(
      'SELECT id_usuario, nombre, email FROM usuarios WHERE id_usuario = ?',
      [id_usuario]
    );

    if (usuario.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      id_usuario: id_usuario,
      usuario: {
        nombre: usuario[0].nombre,
        email: usuario[0].email
      }
    });
  } catch (error) {
    console.error('Error al validar token de recuperación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al validar token de recuperación',
      error: error.message
    });
  }
});

export default router;