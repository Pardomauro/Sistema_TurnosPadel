import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { obtenerCanchas } from '../../api/canchas';
import { crearReserva, verificarDisponibilidadCancha } from '../../api/reservas';
import { useAuth } from '../../context/AuthContext';

const NuevaReserva = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [canchas, setCanchas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCanchas, setLoadingCanchas] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        id_cancha: '',
        id_usuario: '',
        email_usuario: '',
        nombre_usuario: '',
        fecha: '',
        hora: '',
        duracion: 60,
        precio: '',
        estado: 'reservado'
    });

    const horariosDisponibles = [
        '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
        '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    useEffect(() => {
        cargarCanchas();
    }, []);

    const cargarCanchas = async () => {
        try {
            setLoadingCanchas(true);
            const canchasData = await obtenerCanchas();
            console.log('Canchas obtenidas:', canchasData); // Para debug
            setCanchas(Array.isArray(canchasData) ? canchasData : []);
        } catch (err) {
            console.error('Error cargando canchas:', err);
            setError('Error al cargar las canchas: ' + err.message);
            setCanchas([]);
        } finally {
            setLoadingCanchas(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar mensajes cuando el usuario cambia algo
        if (error) setError('');
        if (success) setSuccess('');

        // Si cambia la cancha, actualizar el precio automáticamente
        if (name === 'id_cancha') {
            const canchaSelecionada = canchas.find(c => c.id_cancha === parseInt(value));
            if (canchaSelecionada) {
                setFormData(prev => ({
                    ...prev,
                    precio: canchaSelecionada.precio || ''
                }));
            }
        }
    };

    const validarFormulario = () => {
        if (!formData.id_cancha) {
            setError('Debes seleccionar una cancha');
            return false;
        }
        
        if (!formData.nombre_usuario.trim()) {
            setError('El nombre del usuario es obligatorio');
            return false;
        }

        if (!formData.email_usuario.trim()) {
            setError('El email del usuario es obligatorio');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email_usuario)) {
            setError('El email no tiene un formato válido');
            return false;
        }

        if (!formData.fecha) {
            setError('Debes seleccionar una fecha');
            return false;
        }

        // Validar que la fecha no sea en el pasado
        const fechaSeleccionada = new Date(formData.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaSeleccionada < hoy) {
            setError('No puedes crear reservas para fechas pasadas');
            return false;
        }

        if (!formData.hora) {
            setError('Debes seleccionar una hora');
            return false;
        }

        if (!formData.duracion || formData.duracion < 30) {
            setError('La duración mínima es de 30 minutos');
            return false;
        }

        if (!formData.precio || parseFloat(formData.precio) <= 0) {
            setError('Debes especificar un precio válido');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validarFormulario()) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Verificar disponibilidad antes de crear la reserva
            const disponibilidad = await verificarDisponibilidadCancha(
                formData.id_cancha,
                formData.fecha,
                formData.hora
            );

            if (!disponibilidad.success || !disponibilidad.disponible) {
                setError('La cancha no está disponible en el horario seleccionado');
                return;
            }

            // Preparar datos para la reserva
            // Mantener el formato simple para evitar problemas de zona horaria
            const fechaHora = `${formData.fecha} ${formData.hora}:00`;
            
            console.log('Fecha y hora enviada:', fechaHora);
            
            const reservaData = {
                id_usuario: formData.id_usuario || null, // null para usuarios nuevos
                id_cancha: parseInt(formData.id_cancha),
                fecha_turno: fechaHora,
                duracion: parseInt(formData.duracion),
                precio: parseFloat(formData.precio),
                estado: formData.estado,
                email: formData.email_usuario,
                nombre: formData.nombre_usuario
            };

            const response = await crearReserva(reservaData);
            
            if (response.success) {
                setSuccess('¡Reserva creada exitosamente!');
                setTimeout(() => {
                    navigate('/admin');
                }, 2000);
            } else {
                setError(response.message || 'Error al crear la reserva');
            }

        } catch (err) {
            console.error('Error creando reserva:', err);
            setError(err.message || 'Error al crear la reserva');
        } finally {
            setLoading(false);
        }
    };

    if (loadingCanchas) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 lg:py-12 px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
                            <svg className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Nueva Reserva</h2>
                        <p className="mt-2 text-sm sm:text-base text-gray-600">
                            Crea una nueva reserva como administrador
                        </p>
                        <div className="mt-4">
                            <button
                                onClick={() => navigate('/admin')}
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 transition duration-200"
                            >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                            <div className="flex">
                                <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{success}</span>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            <div className="flex">
                                <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* Información del Usuario */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Información del Usuario</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_usuario"
                                        value={formData.nombre_usuario}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email_usuario"
                                        value={formData.email_usuario}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
                                        placeholder="ejemplo@correo.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Información de la Reserva */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Detalles de la Reserva</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cancha *
                                    </label>
                                    <select
                                        name="id_cancha"
                                        value={formData.id_cancha}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        required
                                    >
                                        <option value="">Seleccionar cancha</option>
                                        {canchas.filter(cancha => !cancha.en_mantenimiento).map(cancha => (
                                            <option key={cancha.id_cancha} value={cancha.id_cancha}>
                                                Cancha {cancha.id_cancha} - ${cancha.precio?.toLocaleString()}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    >
                                        <option value="reservado">Reservado</option>
                                        <option value="completado">Completado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Fecha y Hora */}
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Fecha y Horario</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha *
                                    </label>
                                    <input
                                        type="date"
                                        name="fecha"
                                        value={formData.fecha}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora *
                                    </label>
                                    <select
                                        name="hora"
                                        value={formData.hora}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        required
                                    >
                                        <option value="">Seleccionar hora</option>
                                        {horariosDisponibles.map(hora => (
                                            <option key={hora} value={hora}>
                                                {hora}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duración (min) *
                                    </label>
                                    <select
                                        name="duracion"
                                        value={formData.duracion}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                        required
                                    >
                                        <option value={60}>60 minutos</option>
                                        <option value={90}>90 minutos</option>
                                        <option value={120}>120 minutos</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Precio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">$</span>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                El precio se actualiza automáticamente al seleccionar una cancha
                            </p>
                        </div>

                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="w-full sm:flex-1 py-2 sm:py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full sm:flex-1 flex justify-center py-2 sm:py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition duration-200 ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Creando Reserva...
                                    </div>
                                ) : (
                                    'Crear Reserva'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NuevaReserva;