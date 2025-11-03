import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { pool } from '../Config/db.js';
import { enviarCorreo } from '../Servicios/EmailServicio.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { protegerRuta, verificarRol } from '../Servicios/token.js';

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

// Ruta para obtener todos los turnos con paginación
router.get('/turnos', [
    query('pagina').optional().isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),
    query('limite').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe ser un número entre 1 y 100'),
    validarCampos
], async (req, res) => {
    try {
        const { pagina = 1, limite = 10 } = req.query; // Valores predeterminados
        const offset = (pagina - 1) * limite;

        const [filas] = await pool.query(
            `SELECT id_turno, id_usuario, id_cancha, fecha_turno, duracion, precio, estado, fecha_creacion, fecha_actualizacion
             FROM turnos
             LIMIT ? OFFSET ?`,
            [parseInt(limite), parseInt(offset)]
        );

        const [total] = await pool.query('SELECT COUNT(*) AS total FROM turnos');

        res.status(200).json({
            exito: true,
            datos: filas,
            total: total[0].total,
            pagina: parseInt(pagina),
            limite: parseInt(limite)
        });
    } catch (error) {
        console.error('Error al obtener los turnos:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al obtener los turnos',
            error: error.message
        });
    }
});

// Ruta para obtener un turno por ID
router.get('/turnos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de turno inválido'
            });
        }

        const [rows] = await pool.query(`SELECT
            id_turno,
            id_usuario,
            id_cancha,
            fecha_turno,
            duracion,
            precio,
            estado,
            fecha_creacion,
            fecha_actualizacion
        FROM turnos
        WHERE id_turno = ?`, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turno no encontrado'
            });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener el turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al obtener el turno',
            error: error.message
        });
    }
});


// Ruta para verificar disponibilidad de una cancha
router.get('/turnos/disponibilidad/:id_cancha/:fecha/:hora', async (req, res) => {
    try {
        const { id_cancha, fecha, hora } = req.params;

        // Validar formato de fecha
        const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexFecha.test(fecha)) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El formato de la fecha debe ser YYYY-MM-DD'
            });
        }

        // Validar formato de hora (HH:MM)
        const regexHora = /^\d{2}:\d{2}$/;
        if (!regexHora.test(hora)) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El formato de la hora debe ser HH:MM'
            });
        }

        // Crear la fecha y hora completa
        const fechaHoraInicio = `${fecha} ${hora}:00`;
        
        // Verificar si hay turnos en esa cancha y horario (considerando duraciones)
        const [turnos] = await pool.query(
            `SELECT id_turno, fecha_turno, duracion 
             FROM turnos 
             WHERE id_cancha = ? 
             AND DATE(fecha_turno) = ? 
             AND estado = 'reservado'`,
            [id_cancha, fecha]
        );

        // Verificar conflictos de horario
        const horaInicio = new Date(`${fecha} ${hora}:00`);
        let disponible = true;

        for (let turno of turnos) {
            const turnoInicio = new Date(turno.fecha_turno);
            const turnoFin = new Date(turnoInicio.getTime() + (turno.duracion * 60000)); // duracion en minutos

            // Si el horario solicitado está dentro del rango de otro turno
            if (horaInicio >= turnoInicio && horaInicio < turnoFin) {
                disponible = false;
                break;
            }
        }

        res.status(200).json({
            exito: true,
            disponible: disponible,
            mensaje: disponible ? 'La cancha está disponible' : 'La cancha no está disponible en ese horario'
        });

    } catch (error) {
        console.error('Error al verificar disponibilidad:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al verificar disponibilidad',
            error: error.message
        });
    }
});

// Ruta para obtener turnos por fecha 
router.get('/turnos/fecha/:fecha', async (req, res) => {
    try {
        const { fecha } = req.params;

        // Validar que la fecha esté en el formato correcto (YYYY-MM-DD)
        const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
        if (!regexFecha.test(fecha)) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El formato de la fecha debe ser YYYY-MM-DD'
            });
        }

        // Calcular el inicio y fin del día
        const inicioDia = `${fecha} 00:00:00`;
        const finDia = `${fecha} 23:59:59`;

        const [filas] = await pool.query(
            `SELECT id_turno, id_usuario, id_cancha, fecha_turno, duracion, precio, estado, fecha_creacion, fecha_actualizacion
             FROM turnos
             WHERE fecha_turno BETWEEN ? AND ?`,
            [inicioDia, finDia]
        );

        res.status(200).json({
            exito: true,
            mensaje: 'Turnos obtenidos correctamente',
            total: filas.length,
            datos: filas
        });
    } catch (error) {
        console.error('Error al obtener los turnos por fecha:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al obtener los turnos por fecha',
            error: error.message
        });
    }
});


// Ruta para crear un nuevo turno 
router.post('/turnos', [
    protegerRuta,
    body('id_usuario').isInt().withMessage('ID de usuario inválido'),
    body('id_cancha').isInt().withMessage('ID de cancha inválido'),
    body('fecha_turno').isISO8601().withMessage('Fecha de turno inválida'),
    body('duracion').isInt({ min: 30, max: 180 }).withMessage('La duración debe estar entre 30 y 180 minutos'),
    body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('estado').isIn(['reservado', 'cancelado', 'completado']).withMessage('Estado inválido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('nombre').isString().notEmpty().withMessage('El nombre es requerido'),
    validarCampos
], async (req, res) => {
    try {

        const { id_usuario, id_cancha, fecha_turno, duracion, precio, estado, email, nombre } = req.body;

        // Validar que se proporcionen todos los campos necesarios
        if (!id_usuario || !id_cancha || !fecha_turno || !duracion || !precio || !estado) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            });
        }

        // Validar que el ID de usuario y el ID de cancha sean números
        if (isNaN(id_usuario) || isNaN(id_cancha)) {
            return res.status(400).json({
                success: false,
                message: 'ID de usuario o ID de cancha inválido'
            });
        }

        // Validar que la fecha del turno sea válida
        const fecha = new Date(fecha_turno);
        if (isNaN(fecha.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Fecha de turno inválida'
            });
        }

        // Validar que la duración sea un número positivo
        if (duracion <= 0) {
            return res.status(400).json({
                success: false,
                message: 'La duración debe ser un número positivo'
            });
        }

        // Validar que el precio sea un número positivo
        if (precio < 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número positivo'
            });
        }

        // Validar que el estado sea uno de los valores permitidos
        const estadosPermitidos = ['reservado', 'cancelado', 'completado'];
        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'El estado debe ser uno de los valores permitidos: reservado, cancelado, completado'
            });
        }

        // VALIDAR DISPONIBILIDAD DE LA CANCHA
        if (estado === 'reservado') {
            // Verificar si hay turnos en esa cancha y fecha
            const fechaSolo = fecha_turno.split(' ')[0]; // Extraer solo la fecha (YYYY-MM-DD)
            
            const [turnosExistentes] = await pool.query(
                `SELECT id_turno, fecha_turno, duracion 
                 FROM turnos 
                 WHERE id_cancha = ? 
                 AND DATE(fecha_turno) = ? 
                 AND estado = 'reservado'`,
                [id_cancha, fechaSolo]
            );

            // Verificar conflictos de horario
            const turnoInicio = new Date(fecha_turno);
            const turnoFin = new Date(turnoInicio.getTime() + (duracion * 60000)); // duracion en minutos

            for (let turnoExistente of turnosExistentes) {
                const existenteInicio = new Date(turnoExistente.fecha_turno);
                const existenteFin = new Date(existenteInicio.getTime() + (turnoExistente.duracion * 60000));

                // Verificar si hay solapamiento de horarios
                if ((turnoInicio >= existenteInicio && turnoInicio < existenteFin) ||
                    (turnoFin > existenteInicio && turnoFin <= existenteFin) ||
                    (turnoInicio <= existenteInicio && turnoFin >= existenteFin)) {
                    
                    return res.status(400).json({
                        success: false,
                        message: 'La cancha no está disponible en el horario solicitado'
                    });
                }
            }
        }


        // Insertar el nuevo turno en la base de datos

        const [result] = await pool.query(`INSERT INTO turnos
            (id_usuario, id_cancha, fecha_turno, duracion, precio, estado)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [id_usuario, id_cancha, fecha_turno, duracion, precio, estado]);

        // Enviar correo de confirmación
        await enviarCorreo({
            destinatario: email,
            asunto: 'Confirmación de Reserva',
            contenidoHTML: `
                <h1>Reserva Confirmada</h1>
                <p>Hola ${nombre},</p>
                <p>Tu reserva para la cancha ${id_cancha} ha sido confirmada.</p>
                <ul>
                  <li><strong>Fecha:</strong> ${fecha_turno.split(' ')[0]}</li>
                  <li><strong>Horario:</strong> ${fecha_turno.split(' ')[1]}</li>
                  <li><strong>Precio:</strong> $${precio}</li>
                </ul>
                <p>¡Gracias por elegirnos!</p>
            `,
        });

        res.status(201).json({
            success: true,
            message: 'Turno creado exitosamente',
            id_turno: result.insertId
        });

    } catch (error) {
        console.error('Error al crear el turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al crear el turno',
            error: error.message
        });
    }
});

// Ruta para actualizar un turno por ID

// Permitir actualizaciones parciales en PUT /turnos/:id
router.put('/turnos/:id', [
    protegerRuta,
    param('id').isInt().withMessage('ID de turno inválido'),
    body('id_usuario').optional().isInt().withMessage('ID de usuario inválido'),
    body('id_cancha').optional().isInt().withMessage('ID de cancha inválido'),
    body('fecha_turno').optional().isISO8601().withMessage('Fecha de turno inválida'),
    body('duracion').optional().isInt({ min: 30, max: 180 }).withMessage('La duración debe estar entre 30 y 180 minutos'),
    body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
    body('estado').optional().isIn(['reservado', 'cancelado', 'completado']).withMessage('Estado inválido'),
    validarCampos
], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_usuario, id_cancha, fecha_turno, duracion, precio, estado } = req.body;

        // Construir dinámicamente la consulta de actualización
        const campos = [];
        const valores = [];

        if (id_usuario) {
            campos.push('id_usuario = ?');
            valores.push(id_usuario);
        }
        if (id_cancha) {
            campos.push('id_cancha = ?');
            valores.push(id_cancha);
        }
        if (fecha_turno) {
            campos.push('fecha_turno = ?');
            valores.push(fecha_turno);
        }
        if (duracion) {
            campos.push('duracion = ?');
            valores.push(duracion);
        }
        if (precio) {
            campos.push('precio = ?');
            valores.push(precio);
        }
        if (estado) {
            campos.push('estado = ?');
            valores.push(estado);
        }

        if (campos.length === 0) {
            return res.status(400).json({
                exito: false,
                mensaje: 'No se proporcionaron campos para actualizar'
            });
        }

        const consulta = `UPDATE turnos SET ${campos.join(', ')} WHERE id_turno = ?`;
        valores.push(id);

        const [resultado] = await pool.query(consulta, valores);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                exito: false,
                mensaje: 'Turno no encontrado'
            });
        }

        res.json({
            exito: true,
            mensaje: 'Turno actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar el turno:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno al actualizar el turno',
            error: error.message
        });
    }
});

// Ruta para eliminar un turno por ID
router.delete('/turnos/:id', [
    protegerRuta,
    verificarRol(['administrador']),
    param('id').isInt().withMessage('ID de turno inválido'),
    validarCampos
], async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el id sea un número
        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de turno inválido'
            });
        }

        const [result] = await pool.query(`DELETE FROM turnos WHERE id_turno = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Turno no encontrado'

            });
        }

        res.json({
            success: true,
            message: 'Turno eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar el turno:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno al eliminar el turno',
            error: error.message
        });
    }
});

export default router;