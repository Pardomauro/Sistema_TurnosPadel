import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerCanchaPorId } from '../../api/canchas';

export default function DetalleCancha() {
    const { id } = useParams();
    const [cancha, setCancha] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarDetalleCancha();
    }, [id]);

    const cargarDetalleCancha = async () => {
        try {
            const data = await obtenerCanchaPorId(id);
            setCancha(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los detalles de la cancha');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Cargando detalles...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center py-4">{error}</div>;
    }

    if (!cancha) {
        return <div className="text-center py-4">No se encontró la cancha</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Cancha {cancha.numero}</h1>
                    <Link 
                        to="/canchas"
                        className="text-blue-500 hover:text-blue-700"
                    >
                        Volver a la lista
                    </Link>
                </div>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">Información General</h2>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Tipo</p>
                                <p className="font-medium">{cancha.tipo}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Estado</p>
                                <p className={`font-medium ${
                                    cancha.estado === 'disponible' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {cancha.estado.charAt(0).toUpperCase() + cancha.estado.slice(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Características</h2>
                        <div className="mt-2">
                            <p className="text-gray-600">Superficie</p>
                            <p className="font-medium">{cancha.superficie}</p>
                        </div>
                        {cancha.techada && (
                            <div className="mt-2">
                                <p className="text-gray-600">Techada</p>
                                <p className="font-medium">Sí</p>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold">Tarifas</h2>
                        <div className="mt-2 space-y-2">
                            {cancha.tarifas && Object.entries(cancha.tarifas).map(([horario, precio]) => (
                                <div key={horario} className="flex justify-between">
                                    <span className="text-gray-600">{horario}</span>
                                    <span className="font-medium">${precio}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <Link 
                        to={`/canchas/editar/${cancha._id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Editar Cancha
                    </Link>
                </div>
            </div>
        </div>
    );
}