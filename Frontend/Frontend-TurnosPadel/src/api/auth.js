// API para la autenticación de usuarios 

const API_BASE_URL = 'http://localhost:3000/api';

// Función para iniciar sesión
export const loginUsuario = async (email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Error en la solicitud de login');
        }
    } catch (error) {
        console.error('Error en la función loginUsuario:', error);
        throw error;
    }
};

// Función para gestión de Registro de Usuarios
export const registrarUsuario = async (nombre, email, password) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Error en la solicitud de registro');
        }
    } catch (error) {
        console.error('Error en la función registrarUsuario:', error);
        throw error;
    }
};

// Función para recuperación de contraseña (enviar email con token)
export const recuperarContrasena = async (email) => {
    try {
        const response = await fetch(`${API_BASE_URL}/recuperar-contrasena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Error en la solicitud de recuperación de contraseña');
        }
    } catch (error) {
        console.error('Error en la función recuperarContrasena:', error);
        throw error;
    }
};

// Función para restablecer contraseña con token
export const restablecerContrasena = async (token, nuevaContrasena) => {
    try {
        const response = await fetch(`${API_BASE_URL}/restablecer-contrasena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, nuevaContrasena })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Error en la solicitud de restablecimiento de contraseña');
        }
    } catch (error) {
        console.error('Error en la función restablecerContrasena:', error);
        throw error;
    }
};

// Función para validar token de recuperación
export const validarTokenRecuperacion = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/validar-token-recuperacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            throw new Error('Token inválido o expirado');
        }
    } catch (error) {
        console.error('Error en la función validarTokenRecuperacion:', error);
        throw error;
    }
};

// NOTA: La función obtenerPerfilUsuario se movió a usuarios.js 
// para mantener mejor organización del código (funciones CRUD de usuarios)
