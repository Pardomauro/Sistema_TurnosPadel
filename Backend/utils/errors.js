// Clase base para errores personalizados
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Error 404 - No encontrado
export class NotFoundError extends AppError {
    constructor(message = 'Recurso no encontrado') {
        super(message, 404);
    }
}

// Error 400 - Bad Request
export class BadRequestError extends AppError {
    constructor(message = 'Solicitud inválida') {
        super(message, 400);
    }
}

// Error 403 - Forbidden
export class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
    }
}

// Error 401 - Unauthorized
export class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}

// Error 409 - Conflict
export class ConflictError extends AppError {
    constructor(message = 'Conflicto con el estado actual') {
        super(message, 409);
    }
}

// Error 500 - Internal Server Error
export class InternalServerError extends AppError {
    constructor(message = 'Error interno del servidor') {
        super(message, 500);
    }
}

// Manejador global de errores
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Modo desarrollo
    if (process.env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }

    // Modo producción
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Error de programación u otros errores desconocidos: no enviar detalles
    console.error('ERROR ', err);
    return res.status(500).json({
        status: 'error',
        message: 'Algo salió mal!'
    });
};