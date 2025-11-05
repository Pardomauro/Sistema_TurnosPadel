import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors.js';

// Generar token de acceso
export function generarToken(payload, expiresIn = '1d') {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// Generar token de recuperación de contraseña
export function generarTokenRecuperacion(usuario_id) {
    return generarToken({ id: usuario_id }, '1h');
}

// Verificar token
export function verificarToken(token) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno');
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new UnauthorizedError('Token inválido o expirado');
    }
}

// Middleware para proteger rutas
export function protegerRuta(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedError('No se proporcionó token de autenticación');
        }

        // En entornos de desarrollo aceptamos tokens temporales de administrador
        // con prefijo `admin-token-`. Esto permite loguear al admin desde el
        // frontend sin un JWT real durante el desarrollo. En producción
        // siempre se requiere un JWT válido.
        if (process.env.NODE_ENV !== 'production' && typeof token === 'string' && token.startsWith('admin-token-')) {
            req.usuario = { id: 'admin-1', rol: 'administrador', email: 'admin@local' };
            return next();
        }

        const decoded = verificarToken(token);
        req.usuario = decoded;
        next();
    } catch (error) {
        next(error);
    }
}

// Middleware para verificar roles
export function verificarRol(roles) {
    return (req, res, next) => {
        if (!req.usuario) {
            return next(new UnauthorizedError('Usuario no autenticado'));
        }

        if (!roles.includes(req.usuario.rol)) {
            return next(new UnauthorizedError('No tienes permiso para realizar esta acción'));
        }

        next();
    };
}