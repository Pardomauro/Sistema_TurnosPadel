import { validationResult } from 'express-validator';

/**
 * Middleware genérico para validar campos usando express-validator
 * @param {Request} req - Request object
 * @param {Response} res - Response object  
 * @param {NextFunction} next - Next function
 */
export const validarCampos = (req, res, next) => {
    const errores = validationResult(req);
    
    // Log para debugging
    console.log('🔍 Validación de campos:', {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        erroresEncontrados: errores.array()
    });
    
    if (!errores.isEmpty()) {
        const response = {
            success: false,
            message: 'Errores de validación',
            errors: errores.array(),
            datosRecibidos: {
                body: req.body,
                params: req.params
            }
        };
        
        console.log('❌ Validación fallida:', response);
        return res.status(400).json(response);
    }
    
    console.log('✅ Validación exitosa');
    next();
};

/**
 * Middleware para validar que el ID sea un número válido
 * @param {Request} req - Request object
 * @param {Response} res - Response object  
 * @param {NextFunction} next - Next function
 */
export const validarId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'ID inválido - debe ser un número mayor a 0'
        });
    }
    
    next();
};

/**
 * Middleware para manejar errores de servidor de forma consistente
 * @param {Error} error - Error object
 * @param {string} operacion - Descripción de la operación que falló
 * @param {Response} res - Response object
 */
export const manejarErrorServidor = (error, operacion, res) => {
    console.error(`Error en ${operacion}:`, error);
    return res.status(500).json({
        success: false,
        message: `Error interno del servidor en ${operacion}`,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
};