import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { obtenerCanchaPorId } from '../../api/canchas';
import { obtenerHorariosDisponibles, crearReserva } from '../../api/reservas';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../accionesCriticas/ConfirmDialog';


const NuevaReservaUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [cancha, setCancha] = useState(null);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);
    const [horariosOcupados, setHorariosOcupados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reservando, setReservando] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmData, setConfirmData] = useState(null);


    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        duracion: 60,
        nombre: user?.nombre || '',
        email: user?.email || ''
    });

    useEffect(() => {
        cargarCancha();
    }, [id]);

    useEffect(() => {
        if (formData.fecha && id) {
            cargarHorariosDisponibles();
        }
    }, [formData.fecha, formData.duracion, id]);

    const cargarCancha = async () => {
        try {
            setLoading(true);
            const data = await obtenerCanchaPorId(id);
            setCancha(data);
            setError('');
            
            // Si hay fecha seleccionada, recargar horarios
            if (formData.fecha) {
                cargarHorariosDisponibles();
            }
        } catch (err) {
            setError('Error al cargar los datos de la cancha');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const cargarHorariosDisponibles = async () => {
        try {
            const response = await obtenerHorariosDisponibles(id, formData.fecha, formData.duracion);
            if (response.success) {
                setHorariosDisponibles(response.data.horarios_disponibles);
                setHorariosOcupados(response.data.horarios_ocupados);
            }
        } catch (err) {
            console.error('Error al cargar horarios:', err);
            setHorariosDisponibles([]);
            setHorariosOcupados([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validaciones
        if (!formData.fecha || !formData.hora || !formData.nombre || !formData.email) {
            setError('Todos los campos son obligatorios');
            return;
        }

        // Preparar datos para la confirmación
        const fechaFormateada = new Date(formData.fecha).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        setConfirmData({
            cancha: cancha?.id_cancha,
            fecha: fechaFormateada,
            hora: formData.hora,
            duracion: formData.duracion,
            precio: cancha?.precio,
            nombre: formData.nombre,
            email: formData.email
        });

        setShowConfirm(true);
    };

    const confirmarReserva = async () => {
        setShowConfirm(false);
        setReservando(true);

        try {
            // Construir fecha y hora completa
            const fechaHoraCompleta = `${formData.fecha} ${formData.hora}:00`;

            const reservaData = {
                id_usuario: user?.userId || null,
                id_cancha: parseInt(id),
                fecha_turno: fechaHoraCompleta,
                duracion: parseInt(formData.duracion),
                precio: cancha?.precio || 0,
                estado: 'reservado',
                nombre: formData.nombre,
                email: formData.email
            };

            console.log('Creando reserva:', reservaData);

            await crearReserva(reservaData);
            
            // Mostrar éxito y redirigir
            alert('¡Reserva creada exitosamente! Te hemos enviado una confirmación por email.');
            navigate('/reservas/historial');

        } catch (err) {
            setError(err.message || 'Error al crear la reserva');
            console.error('Error:', err);
        } finally {
            setReservando(false);
        }
    };

    const cancelarConfirmacion = () => {
        setShowConfirm(false);
        setConfirmData(null);
    };

    const obtenerFechaMinima = () => {
        const hoy = new Date();
        return hoy.toISOString().split('T')[0];
    };

    const obtenerFechaMaxima = () => {
        const hoy = new Date();
        const treintaDias = new Date(hoy.getTime() + (30 * 24 * 60 * 60 * 1000));
        return treintaDias.toISOString().split('T')[0];
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">Cargando datos de la cancha...</div>
            </div>
        );
    }

    if (error && !cancha) {
        return (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Link 
                        to="/canchas" 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Volver a Canchas
                    </Link>
                </div>
            </div>
        );
    }

    if (cancha?.en_mantenimiento) {
        return (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Cancha en Mantenimiento</h2>
                    <p className="text-gray-600 mb-4">
                        La Cancha {cancha.id_cancha} no está disponible actualmente.
                    </p>
                    <Link 
                        to="/canchas" 
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Volver a Canchas
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-4 sm:mt-8 p-4 sm:p-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">Reservar Cancha {cancha?.id_cancha}</h2>
                <Link 
                    to="/canchas"
                    className="text-blue-500 hover:text-blue-700 text-sm sm:text-base"
                >
                    ← Volver a Canchas
                </Link>
            </div>

            {/* Información de la cancha */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Información de la Cancha</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p><span className="font-medium">Precio:</span> ${cancha?.precio?.toLocaleString()}</p>
                    <p><span className="font-medium">Estado:</span> <span className="text-green-600">Disponible</span></p>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información del usuario */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Selección de fecha */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha *
                    </label>
                    <input
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleChange}
                        min={obtenerFechaMinima()}
                        max={obtenerFechaMaxima()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Puedes reservar hasta 30 días de anticipación
                    </p>
                </div>

                {/* Selección de duración */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Duración
                    </label>
                    <select
                        name="duracion"
                        value={formData.duracion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="60">1 hora (60 min)</option>
                        <option value="90">1.5 horas (90 min)</option>
                        <option value="120">2 horas (120 min)</option>
                    </select>
                </div>

                {/* Horarios disponibles */}
                {formData.fecha && (
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Horarios Disponibles *
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    cargarHorariosDisponibles();
                                }}
                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded transition-colors"
                                title="Recargar horarios actualizados"
                            >
                                🔄 Actualizar
                            </button>
                        </div>
                        
                        {horariosDisponibles.length > 0 ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {horariosDisponibles.map((horario, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="hora"
                                                value={horario.hora}
                                                checked={formData.hora === horario.hora}
                                                onChange={handleChange}
                                                className="mr-2"
                                            />
                                            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded flex-1 text-center">
                                                {horario.horario}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                
                                {horariosOcupados.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-gray-600 mb-2">
                                            Horarios no disponibles:
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {horariosOcupados.map((horario, index) => (
                                                <div key={index} className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded text-center">
                                                    {horario.horario}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : formData.fecha ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay horarios disponibles para la fecha seleccionada</p>
                                <p className="text-sm mt-2">Intenta con otra fecha</p>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-400">
                                <p>Selecciona una fecha para ver los horarios disponibles</p>
                            </div>
                        )}
                    </div>
                )}



                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={reservando || !formData.fecha || !formData.hora || !formData.nombre || !formData.email}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                        reservando || !formData.fecha || !formData.hora || !formData.nombre || !formData.email
                            ? 'bg-gray-400 cursor-not-allowed text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {reservando ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creando reserva...
                        </div>
                    ) : (
                        'Confirmar Reserva'
                    )}
                </button>
            </form>

            {/* Modal de Confirmación */}
            {showConfirm && confirmData && (
                <ConfirmDialog 
                    isOpen={showConfirm}
                    onConfirm={confirmarReserva}
                    onCancel={cancelarConfirmacion}
                    title="Confirmar Reserva"
                    message={
                        <div className="space-y-3">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-semibold text-gray-800">Detalles de la Reserva</h4>
                                <div className="mt-2 space-y-2 text-sm">
                                    <p><span className="font-medium">Cancha:</span> {confirmData.cancha}</p>
                                    <p><span className="font-medium">Fecha:</span> {confirmData.fecha}</p>
                                    <p><span className="font-medium">Hora:</span> {confirmData.hora}</p>
                                    <p><span className="font-medium">Duración:</span> {confirmData.duracion} minutos</p>
                                    <p><span className="font-medium">Precio:</span> ${confirmData.precio}</p>
                                    {confirmData.nombre && (
                                        <p><span className="font-medium">Nombre:</span> {confirmData.nombre}</p>
                                    )}
                                    {confirmData.email && (
                                        <p><span className="font-medium">Email:</span> {confirmData.email}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-center pt-2">
                                <p className="text-sm text-gray-600">
                                    ¿Confirmas que deseas hacer esta reserva?
                                </p>
                            </div>
                        </div>
                    }
                />
            )}
        </div>
    );
};

export default NuevaReservaUsuario;