import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { obtenerCanchas } from '../../api/canchas';

export default function ListaCanchas() {
    const [canchas, setCanchas] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarCanchas();
    }, []);

    const cargarCanchas = async () => {
        try {
            const data = await obtenerCanchas();
            setCanchas(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar las canchas');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-4">Cargando canchas...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-center py-4">{error}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Canchas de Pádel</h1>
                <Link 
                    to="/canchas/crear" 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                    Nueva Cancha
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {canchas.map((cancha) => (
                    <div 
                        key={cancha._id} 
                        className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-xl font-semibold mb-2">Cancha {cancha.numero}</h2>
                        <p className="text-gray-600 mb-2">{cancha.tipo}</p>
                        <p className={`mb-3 ${cancha.estado === 'disponible' ? 'text-green-600' : 'text-red-600'}`}>
                            {cancha.estado.charAt(0).toUpperCase() + cancha.estado.slice(1)}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                            <Link 
                                to={`/canchas/${cancha._id}`}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                Ver detalles
                            </Link>
                            <Link 
                                to={`/canchas/editar/${cancha._id}`}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Editar
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}