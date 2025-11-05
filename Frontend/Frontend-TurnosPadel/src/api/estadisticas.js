// API para estadísticas del dashboard administrativo

const API_BASE_URL = 'http://localhost:3000/api';

// Helper para crear headers con Authorization si existe token
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
};

// Función para obtener estadísticas generales
export const obtenerEstadisticas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener las estadísticas');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
};

// Función para obtener estadísticas de canchas
export const obtenerEstadisticasCanchas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas/canchas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas de canchas');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener estadísticas de canchas:', error);
        throw error;
    }
};

// Función para obtener estadísticas de reservas
export const obtenerEstadisticasReservas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas/reservas`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas de reservas');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener estadísticas de reservas:', error);
        throw error;
    }
};

// Función para obtener estadísticas de usuarios
export const obtenerEstadisticasUsuarios = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas/usuarios`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener estadísticas de usuarios');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener estadísticas de usuarios:', error);
        throw error;
    }
};

// Función para obtener ingresos del mes
export const obtenerIngresosMes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/estadisticas/ingresos`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Error al obtener ingresos del mes');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error al obtener ingresos del mes:', error);
        throw error;
    }
};