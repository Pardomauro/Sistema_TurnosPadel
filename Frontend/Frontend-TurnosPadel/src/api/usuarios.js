
// Peticiones http relacionadas con los usuarios

const API_BASE_URL = 'http://localhost:3000/api';

// Helper para crear headers con Authorization
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Función para obtener todos los usuarios (solo administrador)
export const obtenerUsuarios = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener los usuarios');
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Función para obtener un usuario por ID (solo administrador)
export const obtenerUsuarioPorId = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener el usuario');
        }
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Función para crear un nuevo usuario (registro directo por admin)
// Para registro de usuarios normales, usar registrarUsuario en auth.js
export const crearUsuario = async (usuario) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            throw new Error('Error al crear el usuario');
        }
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Función para actualizar un usuario existente (solo administrador)
// Campos opcionales: nombre, email, password
export const actualizarUsuario = async (id, datosUsuario) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(datosUsuario)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el usuario');
        }
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Función para eliminar un usuario (solo administrador)
export const eliminarUsuario = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al eliminar el usuario');
        }
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Función para obtener el perfil de un usuario específico
// Esta función también está disponible en auth.js como obtenerPerfilUsuario
export const obtenerPerfilUsuario = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener el perfil del usuario');
        }
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// Las funciones de validación están disponibles en ../utils
// Importar validarDatosUsuario si necesitas validar datos antes de enviarlos

