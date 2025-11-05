/**
 * Función auxiliar para parsear horarios de forma segura
 * @param {Array|string} horarios - Horarios en formato array o string JSON
 * @returns {Array} Array de horarios parseados
 */
export const parsearHorarios = (horarios) => {
    if (Array.isArray(horarios)) {
        return horarios;
    } else if (typeof horarios === 'string') {
        try {
            return JSON.parse(horarios);
        } catch (e) {
            console.error('Error parseando horarios:', e);
            return [];
        }
    }
    return [];
};

/**
 * Función auxiliar para validar campos de actualización
 * @param {Object} body - Cuerpo de la petición
 * @param {Array} camposPermitidos - Array de campos que se pueden actualizar
 * @returns {boolean} True si hay al menos un campo válido para actualizar
 */
export const validarCamposActualizacion = (body, camposPermitidos) => {
    return camposPermitidos.some(campo => body[campo] !== undefined);
};

/**
 * Función para validar el formato del email
 * @param {string} email - Email a validar
 * @returns {boolean} True si el email es válido
 */
export const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Función auxiliar para convertir fecha a formato MySQL
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} Fecha en formato MySQL YYYY-MM-DD HH:MM:SS
 */
export const convertirFechaMySQL = (fechaISO) => {
    // Si viene en formato "YYYY-MM-DD HH:MM:SS", mantenerlo tal como está
    if (!fechaISO.includes('T')) return fechaISO;
    
    // Si viene en formato ISO, convertir pero manteniendo la hora local
    const fecha = new Date(fechaISO);
    return fecha.getFullYear() + '-' + 
           String(fecha.getMonth() + 1).padStart(2, '0') + '-' + 
           String(fecha.getDate()).padStart(2, '0') + ' ' + 
           String(fecha.getHours()).padStart(2, '0') + ':' + 
           String(fecha.getMinutes()).padStart(2, '0') + ':' + 
           String(fecha.getSeconds()).padStart(2, '0');
};

/**
 * Función auxiliar para validar disponibilidad de horario
 * @param {Array} turnosExistentes - Turnos ya reservados
 * @param {Date} inicioNuevo - Inicio del nuevo turno
 * @param {number} duracionNueva - Duración del nuevo turno en minutos
 * @returns {boolean} True si el horario está disponible
 */
export const validarDisponibilidadHorario = (turnosExistentes, inicioNuevo, duracionNueva) => {
    const finNuevo = new Date(inicioNuevo.getTime() + (duracionNueva * 60000));
    
    for (let turnoExistente of turnosExistentes) {
        const inicioExistente = new Date(turnoExistente.fecha_turno);
        const finExistente = new Date(inicioExistente.getTime() + (turnoExistente.duracion * 60000));

        // Verificar si hay solapamiento de horarios
        if ((inicioNuevo >= inicioExistente && inicioNuevo < finExistente) ||
            (finNuevo > inicioExistente && finNuevo <= finExistente) ||
            (inicioNuevo <= inicioExistente && finNuevo >= finExistente)) {
            return false; // Hay conflicto
        }
    }
    return true; // No hay conflicto
};