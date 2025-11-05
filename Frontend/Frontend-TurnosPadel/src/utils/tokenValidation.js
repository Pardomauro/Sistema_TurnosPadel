// Utilidad para validar tokens con el backend
const API_BASE_URL = 'http://localhost:3000/api';

export const validarToken = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/validar-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.success;
        }
        return false;
    } catch (error) {
        console.error('Error validando token:', error);
        return false;
    }
};