import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { crearCancha, actualizarCancha, obtenerCanchaPorId } from '../../api/canchas';

export default function CrearEditarCancha() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cancha, setCancha] = useState({
        numero: '',
        tipo: 'simple',
        estado: 'disponible',
        superficie: 'césped artificial',
        techada: false,
        tarifas: {
            'mañana': '',
            'tarde': '',
            'noche': ''
        }
    });

    useEffect(() => {
        if (id) {
            cargarCancha();
        }
    }, [id]);

    const cargarCancha = async () => {
        try {
            setLoading(true);
            const data = await obtenerCanchaPorId(id);
            setCancha(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar la cancha');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if (id) {
                await actualizarCancha(id, cancha);
            } else {
                await crearCancha(cancha);
            }

            navigate('/canchas');
        } catch (err) {
            setError('Error al guardar la cancha');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('tarifa_')) {
            const horario = name.replace('tarifa_', '');
            setCancha(prev => ({
                ...prev,
                tarifas: {
                    ...prev.tarifas,
                    [horario]: value
                }
            }));
        } else {
            setCancha(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    if (loading && id) {
        return <div className="text-center py-4">Cargando...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {id ? 'Editar Cancha' : 'Nueva Cancha'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2">Número de Cancha</label>
                        <input
                            type="number"
                            name="numero"
                            value={cancha.numero}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Tipo</label>
                        <select
                            name="tipo"
                            value={cancha.tipo}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="simple">Simple</option>
                            <option value="doble">Doble</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Estado</label>
                        <select
                            name="estado"
                            value={cancha.estado}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="disponible">Disponible</option>
                            <option value="mantenimiento">En Mantenimiento</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Superficie</label>
                        <select
                            name="superficie"
                            value={cancha.superficie}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="césped artificial">Césped Artificial</option>
                            <option value="cemento">Cemento</option>
                            <option value="crystal">Crystal</option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="techada"
                                checked={cancha.techada}
                                onChange={handleChange}
                            />
                            <span className="text-gray-700">Cancha Techada</span>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Tarifas</h3>
                        {Object.entries(cancha.tarifas).map(([horario, precio]) => (
                            <div key={horario}>
                                <label className="block text-gray-700 mb-2">
                                    Tarifa {horario}
                                </label>
                                <input
                                    type="number"
                                    name={`tarifa_${horario}`}
                                    value={precio}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    placeholder="Precio por hora"
                                    required
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/canchas')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}