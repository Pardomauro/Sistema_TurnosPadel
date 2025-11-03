
// Peticiones http relacionadas con las canchas
import { validarDatosCancha } from '../utils';


const API_BASE_URL = 'http://localhost:3000/api';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Función para manejar errores de la API
const handleApiError = (error, customMessage) => {
    console.error('Error en la petición:', error);
    if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(error.response.data?.message || customMessage);
    } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
        // Algo sucedió en la configuración de la petición
        throw new Error(customMessage);
    }
};

// Función para obtener todas las canchas
export const obtenerCanchas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener las canchas');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Función para obtener una cancha específica por ID
export const obtenerCanchaPorId = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas/${id}`, {
            method: 'GET',
            headers: { 
                ...getAuthHeaders()     
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener la cancha');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Función para obtener solo canchas disponibles (no en mantenimiento)
export const obtenerCanchasDisponibles = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas/disponibles`, {
            method: 'GET',
            headers: {
                ...getAuthHeaders()
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las canchas disponibles');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Función para crear una nueva cancha (solo para administradores)
export const crearCancha = async (canchaData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders()
            },
            body: JSON.stringify(canchaData)
        });

        if (!response.ok) {
            throw new Error('Error al crear la cancha');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Función para actualizar una cancha (solo para administradores)
export const actualizarCancha = async (id, canchaData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas/${id}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders()
            },
            body: JSON.stringify(canchaData)
        });

        if (!response.ok) {
            throw new Error('Error al actualizar la cancha');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Función para eliminar una cancha (solo para administradores)
export const eliminarCancha = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas/${id}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });

        if (!response.ok) {
            throw new Error('Error al eliminar la cancha');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};
