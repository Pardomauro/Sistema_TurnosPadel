
// Peticiones http relacionadas con las canchas

const API_BASE_URL = 'http://localhost:3000/api';

// Función para obtener el token de autenticación
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Función para obtener todas las canchas
export const obtenerCanchas = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/canchas`, {
            method: 'GET',
            headers: {
                ...getAuthHeaders()
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener las canchas');
        }

        const data = await response.json();
        console.log('Respuesta API canchas:', data); // Para debug
        
        // Siempre retornar un array para consistencia
        return data.data || data || [];
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
        return data.data || null;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

// Alias para compatibilidad
export const obtenerCancha = obtenerCanchaPorId;

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
        return data.data || [];
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
        console.log('📤 Enviando datos para actualizar cancha:', { id, canchaData });
        
        const response = await fetch(`${API_BASE_URL}/canchas/${id}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders()
            },
            body: JSON.stringify(canchaData)
        });

        console.log('📥 Respuesta del servidor:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        if (!response.ok) {
            let errorMessage = 'Error al actualizar la cancha';
            try {
                const errorData = await response.json();
                console.error('❌ Detalles del error:', errorData);
                errorMessage = errorData.message || errorMessage;
                
                // Si hay errores de validación específicos, mostrarlos
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const validationErrors = errorData.errors.map(err => err.msg).join(', ');
                    errorMessage = `Errores de validación: ${validationErrors}`;
                }
            } catch (parseError) {
                console.error('❌ Error parsing error response:', parseError);
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Cancha actualizada exitosamente:', data);
        return data;
    } catch (error) {
        console.error('❌ Error en la petición:', error);
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
