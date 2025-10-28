
const express = require('express');
const router = express.Router();
const { pool } = require('../Config/db');




// GET /api/canchas - Obtener todas las canchas
router.get('/canchas', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id as id_cancha,
                precio,
                en_mantenimiento,
                horarios_disponibles,
                fecha_creacion,
                fecha_actualizacion
            FROM canchas 
            ORDER BY id ASC
        `);

        res.status(200).json({
            success: true,
            message: 'Canchas obtenidas correctamente',
            data: rows,
            total: rows.length
        });
    } catch (error) {
        console.error('Error al obtener las canchas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener las canchas',
            error: error.message
        });
    }
});

// GET /api/canchas/:id - Obtener una cancha específica por ID
router.get('/canchas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cancha inválido'
            });
        }

        const [rows] = await pool.query(`
            SELECT 
                id as id_cancha,
                precio,
                en_mantenimiento,
                horarios_disponibles,
                fecha_creacion,
                fecha_actualizacion
            FROM canchas 
            WHERE id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cancha obtenida correctamente',
            data: rows[0]
        });
    } catch (error) {
        console.error('Error al obtener la cancha:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener la cancha',
            error: error.message
        });
    }
});

// GET /api/canchas/disponibles - Obtener solo canchas disponibles (no en mantenimiento)
router.get('/canchas/disponibles', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                id as id_cancha,
                precio,
                en_mantenimiento,
                horarios_disponibles,
                fecha_creacion,
                fecha_actualizacion
            FROM canchas 
            WHERE en_mantenimiento = false
            ORDER BY id ASC
        `);

        res.status(200).json({
            success: true,
            message: 'Canchas disponibles obtenidas correctamente',
            data: rows,
            total: rows.length
        });
    } catch (error) {
        console.error('Error al obtener las canchas disponibles:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener las canchas disponibles',
            error: error.message
        });
    }
});

// Ruta para verificar disponibilidad de canchas
app.get('/api/turnos/disponibilidad', [
  body('fecha').isISO8601().withMessage('La fecha debe estar en formato ISO8601 (YYYY-MM-DD)'),
  body('horaInicio').isString().withMessage('La hora de inicio es requerida'),
  body('horaFin').isString().withMessage('La hora de fin es requerida')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { fecha, horaInicio, horaFin, id_cancha } = req.body;

  try {
    const [resultados] = await pool.query(
      `SELECT * FROM turnos WHERE id_cancha = ? AND fecha_turno BETWEEN ? AND ?`,
      [id_cancha, `${fecha} ${horaInicio}`, `${fecha} ${horaFin}`]
    );

    if (resultados.length > 0) {
      return res.status(200).json({ disponible: false, mensaje: 'La cancha no está disponible en el horario solicitado.' });
    }

    res.status(200).json({ disponible: true, mensaje: 'La cancha está disponible.' });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ error: 'Error interno al verificar disponibilidad.' });
  }
});


// POST /api/canchas - Crear una nueva cancha
router.post('/canchas', async (req, res) => {
    try {
        const { precio, en_mantenimiento = false, horarios_disponibles } = req.body;

        // Validaciones básicas
        if (!precio || isNaN(precio) || precio <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número mayor a 0'
            });
        }

        if (typeof en_mantenimiento !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'El estado de mantenimiento debe ser true o false'
            });
        }

        if (!horarios_disponibles || !Array.isArray(horarios_disponibles) || horarios_disponibles.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un horario disponible'
            });
        }

        // Crear la nueva cancha en la base de datos
        const [result] = await pool.query(`
            INSERT INTO canchas (precio, en_mantenimiento, horarios_disponibles, fecha_creacion, fecha_actualizacion)
            VALUES (?, ?, ?, NOW(), NOW())
        `, [precio, en_mantenimiento, JSON.stringify(horarios_disponibles)]);

        // Obtener la cancha recién creada con todos sus campos
        const [newCancha] = await pool.query(`
            SELECT 
                id as id_cancha,
                precio,
                en_mantenimiento,
                horarios_disponibles,
                fecha_creacion,
                fecha_actualizacion
            FROM canchas 
            WHERE id = ?
        `, [result.insertId]);

        // Parsear los horarios para la respuesta
        const canchaCreada = {
            ...newCancha[0],
            horarios_disponibles: JSON.parse(newCancha[0].horarios_disponibles)
        };

        res.status(201).json({
            success: true,
            message: 'Cancha creada correctamente',
            data: canchaCreada
        });
    } catch (error) {
        console.error('Error al crear la cancha:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear la cancha',
            error: error.message
        });
    }
});



// PUT /api/canchas/:id - Actualizar una cancha existente
router.put('/canchas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que el ID sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cancha inválido'
            });
        }

        // Verificar que la cancha exista
        const [canchas] = await pool.query('SELECT * FROM canchas WHERE id = ?', [id]);
        if (canchas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada'
            });
        }

        const { precio, en_mantenimiento, horarios_disponibles } = req.body;
        const canchaActual = canchas[0];

        // Validar que al menos un campo sea enviado para actualizar
        if (precio === undefined && en_mantenimiento === undefined && horarios_disponibles === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        // Validaciones básicas
        if (precio !== undefined && (isNaN(precio) || precio <= 0)) {
            return res.status(400).json({
                success: false,
                message: 'El precio debe ser un número mayor a 0'
            });
        }

        if (en_mantenimiento !== undefined && typeof en_mantenimiento !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'El estado de mantenimiento debe ser true o false'
            });
        }

        if (horarios_disponibles !== undefined && (!Array.isArray(horarios_disponibles) || horarios_disponibles.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un horario disponible'
            });
        }

        // Preparar valores para actualizar (usar valores actuales si no se proporcionan nuevos)
        const precioFinal = precio !== undefined ? precio : canchaActual.precio;
        const mantenimientoFinal = en_mantenimiento !== undefined ? en_mantenimiento : canchaActual.en_mantenimiento;
        const horariosFinal = horarios_disponibles !== undefined ? JSON.stringify(horarios_disponibles) : canchaActual.horarios_disponibles;

        // Actualizar cancha en la base de datos
        await pool.query(
            'UPDATE canchas SET precio = ?, en_mantenimiento = ?, horarios_disponibles = ?, fecha_actualizacion = NOW() WHERE id = ?',
            [precioFinal, mantenimientoFinal, horariosFinal, id]
        );

        // Obtener cancha actualizada con formato consistente
        const [canchaActualizada] = await pool.query(`
            SELECT 
                id as id_cancha,
                precio,
                en_mantenimiento,
                horarios_disponibles,
                fecha_creacion,
                fecha_actualizacion
            FROM canchas 
            WHERE id = ?
        `, [id]);

        // Parsear los horarios para la respuesta
        const canchaResponse = {
            ...canchaActualizada[0],
            horarios_disponibles: JSON.parse(canchaActualizada[0].horarios_disponibles)
        };

        res.status(200).json({
            success: true,
            message: 'Cancha actualizada correctamente',
            data: canchaResponse
        });
    } catch (error) {
        console.error('Error al actualizar la cancha:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar la cancha',
            error: error.message
        });
    }
});

// DELETE /api/canchas/:id - Eliminar una cancha
router.delete('/canchas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el ID sea un número válido
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'ID de cancha inválido'
            });
        }

        // Verificar que la cancha exista y obtener sus datos antes de eliminar
        const [canchas] = await pool.query('SELECT * FROM canchas WHERE id = ?', [id]);
        if (canchas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cancha no encontrada'
            });
        }

        const canchaEliminada = canchas[0];

        // Eliminar la cancha de la base de datos
        const [result] = await pool.execute(
            'DELETE FROM canchas WHERE id = ?',
            [id]
        );

        // Verificar que la eliminación fue exitosa
        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'No se pudo eliminar la cancha'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cancha eliminada correctamente',
            data: {
                id_cancha: canchaEliminada.id,
                eliminada_en: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error al eliminar la cancha:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar la cancha',
            error: error.message
        });
    }
});

module.exports = router; 
