import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCanchas, eliminarCancha } from '../../api/canchas';
import { useAuth } from '../../context/AuthContext';

// Función helper para manejar horarios de forma segura
const getHorariosCount = (horarios) => {
    try {
        if (!horarios) return 0;
        if (Array.isArray(horarios)) return horarios.length;
        if (typeof horarios === 'string') {
            const parsed = JSON.parse(horarios);
            return Array.isArray(parsed) ? parsed.length : 0;
        }
        return 0;
    } catch (error) {
        console.warn('Error parsing horarios:', error);
        return 0;
    }
};

export default function ListaCanchas() {
    const [canchas, setCanchas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [eliminando, setEliminando] = useState(null); // ID de la cancha que se está eliminando
    const { user, isAdmin } = useAuth();

    useEffect(() => {
        cargarCanchas();
    }, []);

    const cargarCanchas = async () => {
        try {
            const canchasData = await obtenerCanchas();
            console.log('Canchas obtenidas:', canchasData); // Para debug
            
            setCanchas(Array.isArray(canchasData) ? canchasData : []);
            setError(null);
        } catch (err) {
            setError('Error al cargar las canchas');
            console.error(err);
            setCanchas([]); // Asegurar que siempre sea un array
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarCancha = async (id, numero) => {
        const confirmacion = window.confirm(
            `¿Estás seguro de que deseas eliminar la Cancha ${numero}?\n\n` +
            `Esta acción no se puede deshacer y se eliminarán también todas las reservas asociadas.`
        );

        if (confirmacion) {
            try {
                setEliminando(id); // Marcar como eliminando
                await eliminarCancha(id);
                await cargarCanchas(); // Recargar la lista
                alert('Cancha eliminada exitosamente');
            } catch (err) {
                console.error('Error al eliminar cancha:', err);
                alert('Error al eliminar la cancha. Por favor, intenta de nuevo.');
            } finally {
                setEliminando(null); // Quitar el estado de carga
            }
        }
    };

    if (loading) {
        return <div className="text-center py-4">Cargando canchas...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center py-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-bold">Canchas de Pádel</h1>
                {isAdmin() && (
                    <Link 
                        to="/canchas/crear" 
                        className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded text-sm sm:text-base transition-colors duration-200"
                    >
                        <span className="hidden sm:inline">Nueva Cancha</span>
                        <span className="sm:hidden">+ Cancha</span>
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {Array.isArray(canchas) && canchas.length > 0 ? canchas.map((cancha) => (
                    <div 
                        key={cancha.id_cancha} 
                        className="border rounded-lg shadow-md p-4 sm:p-5 hover:shadow-lg transition-shadow duration-200 bg-white"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h2 className="text-lg sm:text-xl font-semibold">Cancha {cancha.id_cancha}</h2>
                            <div className={`w-3 h-3 rounded-full ${!cancha.en_mantenimiento ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <p className="text-gray-600 text-sm sm:text-base">
                                <span className="font-medium">Precio:</span> ${cancha.precio?.toLocaleString()}
                            </p>
                            <p className={`text-sm sm:text-base font-medium ${!cancha.en_mantenimiento ? 'text-green-600' : 'text-red-600'}`}>
                                {!cancha.en_mantenimiento ? '✓ Disponible' : '⚠ En Mantenimiento'}
                            </p>
                            <div className="text-xs sm:text-sm text-gray-500">
                                📅 {Array.isArray(cancha.horarios_disponibles) ? cancha.horarios_disponibles.length : getHorariosCount(cancha.horarios_disponibles)} horarios
                            </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                            <Link 
                                to={`/canchas/${cancha.id_cancha}`}
                                className="text-blue-500 hover:text-blue-700 text-sm sm:text-base font-medium transition-colors duration-200"
                            >
                                Ver detalles →
                            </Link>
                            
                            {isAdmin() ? (
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <Link 
                                        to={`/canchas/editar/${cancha.id_cancha}`}
                                        className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors duration-200 text-center"
                                    >
                                        ✏ Editar
                                    </Link>
                                    <button
                                        onClick={() => handleEliminarCancha(cancha.id_cancha, cancha.id_cancha)}
                                        disabled={eliminando === cancha.id_cancha}
                                        className={`text-sm font-medium transition-colors duration-200 text-center ${
                                            eliminando === cancha.id_cancha 
                                                ? 'text-gray-400 cursor-not-allowed' 
                                                : 'text-red-500 hover:text-red-700'
                                        }`}
                                    >
                                        {eliminando === cancha.id_cancha ? '⏳ Eliminando...' : '🗑 Eliminar'}
                                    </button>
                                </div>
                            ) : (
                                // Solo mostrar botón de reservar si la cancha está disponible
                                !cancha.en_mantenimiento && (
                                    <Link 
                                        to={`/reservas/nueva/${cancha.id_cancha}`}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 text-center"
                                    >
                                        Reservar
                                    </Link>
                                )
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        <div className="max-w-md mx-auto">
                            <div className="text-4xl sm:text-6xl mb-4">🎾</div>
                            <p className="text-base sm:text-lg mb-3">No hay canchas disponibles</p>
                            <p className="text-sm text-gray-400 mb-4">Parece que aún no se han creado canchas en el sistema</p>
                            {isAdmin() && (
                                <Link 
                                    to="/canchas/crear" 
                                    className="inline-block bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors duration-200"
                                >
                                    Crear la primera cancha
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}