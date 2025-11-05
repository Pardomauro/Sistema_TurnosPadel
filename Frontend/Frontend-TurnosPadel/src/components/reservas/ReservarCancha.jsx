import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerCancha } from '../../api/canchas';
import { crearReserva } from '../../api/reservas';
import { useAuth } from '../../context/AuthContext';

const ReservarCancha = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [cancha, setCancha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        fecha: '',
        hora: '',
        duracion: 60,
        nombre: user?.nombre || '',
        email: user?.email || ''
    });

    // Horarios disponibles (ejemplo)
    const horariosDisponibles = [
        '08:00', '09:30', '11:00', '12:30', 
        '14:00', '15:30', '17:00', '18:30', 
        '20:00', '21:30'
    ];

    useEffect(() => {
        cargarCancha();
    }, [id]);

    const cargarCancha = async () => {
        try {
            const data = await obtenerCancha(id);
            setCancha(data);
            setLoading(false);
        } catch (err) {
            console.error('Error cargando cancha:', err);
            setError('Error al cargar los datos de la cancha');
            setLoading(false);
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
        setSuccess('');

        if (!formData.fecha || !formData.hora) {
            setError('Por favor selecciona fecha y hora');
            return;
        }

        if (!formData.nombre || !formData.email) {
            setError('Por favor completa tu nombre y email');
            return;
        }

        // Crear fecha en formato ISO8601
        const fechaHora = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();
        
        const reservaData = {
            id_usuario: user?.userId || user?.id,
            id_cancha: parseInt(id),
            fecha_turno: fechaHora,
            duracion: parseInt(formData.duracion),
            precio: cancha?.precio || 0,
            estado: 'reservado',
            nombre: formData.nombre,
            email: formData.email
        };

        setSubmitting(true);
        try {
            console.log('Enviando datos de reserva:', reservaData);
            await crearReserva(reservaData);
            setSuccess('¡Reserva creada exitosamente!');
            setTimeout(() => {
                navigate('/reservas/historial');
            }, 2000);
        } catch (err) {
            console.error('Error creando reserva:', err);
            setError(err.message || 'Error al crear la reserva');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Cargando...</div>;
    }

    if (!cancha) {
        return <div className="text-center py-8 text-red-600">Cancha no encontrada</div>;
    }

    if (cancha.en_mantenimiento) {
        return (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Cancha en Mantenimiento</h2>
                    <p className="text-gray-600 mb-4">
                        La Cancha {cancha.id_cancha} no está disponible actualmente.
                    </p>
                    <button 
                        onClick={() => navigate('/canchas')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Volver a Canchas
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Reservar Cancha {cancha.id_cancha}</h2>
                <button 
                    onClick={() => navigate('/canchas')}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ← Volver
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded mb-6">
                <h3 className="font-semibold mb-2">Información de la Cancha</h3>
                <p className="text-gray-600">Precio: ${cancha.precio?.toLocaleString()}</p>
                <p className="text-green-600">Estado: Disponible</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Hora</label>
                        <select
                            name="hora"
                            value={formData.hora}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecciona una hora</option>
                            {horariosDisponibles.map(hora => (
                                <option key={hora} value={hora}>{hora}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Duración</label>
                    <select
                        name="duracion"
                        value={formData.duracion}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={60}>1 hora (60 min)</option>
                        <option value={90}>1.5 horas (90 min)</option>
                        <option value={120}>2 horas (120 min)</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-semibold mb-2">Resumen de la Reserva</h4>
                    <p>Cancha: {cancha.id_cancha}</p>
                    <p>Fecha: {formData.fecha || 'No seleccionada'}</p>
                    <p>Hora: {formData.hora || 'No seleccionada'}</p>
                    <p>Duración: {formData.duracion} minutos</p>
                    <p className="font-semibold">Total: ${cancha.precio?.toLocaleString()}</p>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/canchas')}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
                    >
                        {submitting ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReservarCancha;