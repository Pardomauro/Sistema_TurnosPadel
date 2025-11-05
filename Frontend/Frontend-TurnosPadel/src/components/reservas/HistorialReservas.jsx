import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerReservasPorUsuario } from '../../api/reservas';
import { useAuth } from '../../context/AuthContext';

const HistorialReservas = () => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarReservas();
    }, []);

    const cargarReservas = async () => {
        try {
            setLoading(true);
            const data = await obtenerReservasPorUsuario(user?.userId);
            setReservas(data || []);
            setError('');
        } catch (err) {
            setError('Error al cargar las reservas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatearFechaHora = (fechaHora) => {
        const fecha = new Date(fechaHora);
        return {
            fecha: fecha.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            hora: fecha.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'reservado': return 'bg-green-100 text-green-800';
            case 'completado': return 'bg-blue-100 text-blue-800';
            case 'cancelado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filtrarReservas = (tipo) => {
        const ahora = new Date();
        return reservas.filter(reserva => {
            const fechaReserva = new Date(reserva.fecha_turno);
            
            switch (tipo) {
                case 'proximas':
                    return fechaReserva > ahora && reserva.estado === 'reservado';
                case 'pasadas':
                    return fechaReserva <= ahora || reserva.estado === 'completado' || reserva.estado === 'cancelado';
                default:
                    return true;
            }
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-64">
                <div className="text-lg">Cargando historial de reservas...</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-4 sm:mt-8 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">Mis Reservas</h2>
                <Link 
                    to="/canchas"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm sm:text-base"
                >
                    Nueva Reserva
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {reservas.length === 0 ? (
                <div className="text-center py-12">
                    <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7l4 8 4-8m-4 8v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v6.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes reservas</h3>
                    <p className="text-gray-500 mb-4">¡Haz tu primera reserva ahora!</p>
                    <Link 
                        to="/canchas"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg inline-block"
                    >
                        Ver Canchas Disponibles
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Próximas reservas */}
                    {filtrarReservas('proximas').length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-green-700">Próximas Reservas</h3>
                            <div className="grid gap-4">
                                {filtrarReservas('proximas').map((reserva) => {
                                    const { fecha, hora } = formatearFechaHora(reserva.fecha_turno);
                                    return (
                                        <div key={reserva.id_turno} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Cancha {reserva.id_cancha}
                                                        </h4>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${obtenerColorEstado(reserva.estado)}`}>
                                                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Fecha:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1 capitalize">{fecha}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Hora:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">{hora}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Duración:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">{reserva.duracion} min</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Precio:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">${reserva.precio?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                                                    <span className="text-xs text-gray-500 sm:text-right">
                                                        Reserva #{reserva.id_turno}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Historial (reservas pasadas) */}
                    {filtrarReservas('pasadas').length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-700">Historial</h3>
                            <div className="grid gap-4">
                                {filtrarReservas('pasadas').map((reserva) => {
                                    const { fecha, hora } = formatearFechaHora(reserva.fecha_turno);
                                    return (
                                        <div key={reserva.id_turno} className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                                        <h4 className="text-lg font-semibold text-gray-700">
                                                            Cancha {reserva.id_cancha}
                                                        </h4>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${obtenerColorEstado(reserva.estado)}`}>
                                                            {reserva.estado.charAt(0).toUpperCase() + reserva.estado.slice(1)}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium">Fecha:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1 capitalize">{fecha}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Hora:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">{hora}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Duración:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">{reserva.duracion} min</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Precio:</span>
                                                            <br className="sm:hidden" />
                                                            <span className="sm:ml-1">${reserva.precio?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                                                    <span className="text-xs text-gray-400 sm:text-right">
                                                        Reserva #{reserva.id_turno}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default HistorialReservas;