
// Peticiones http relacionadas con las canchas

const API_BASE_URL = 'http://localhost:3000/api';

// Función para obtener todas las canchas
export const obtenerCanchas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
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
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
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
                'Content-Type': 'application/json'
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
