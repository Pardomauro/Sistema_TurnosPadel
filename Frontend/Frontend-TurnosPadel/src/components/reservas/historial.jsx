import { useEffect, useState } from 'react';
import { obtenerReservaUsuario, actualizarReservaParcial } from '../../api/reservas';
import { obtenerCanchas } from '../../api/canchas';

const HistorialReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [canchasMap, setCanchasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setError('No estás logueado.');
          setLoading(false);
          return;
        }

        // Cargar canchas para mostrar nombre (opcional)
        try {
          const canchas = await obtenerCanchas();
          const map = {};
          (canchas || []).forEach(c => { map[c.id || c._id] = c.nombre || `Cancha ${c.id || c._id}`; });
          setCanchasMap(map);
        } catch (e) {
          console.warn('No se pudieron cargar canchas', e);
        }

        // Usar el endpoint específico del backend para sacar las reservas del usuario
        let data = await obtenerReservaUsuario(userId);

        // Ordenar por fecha descendente
        data = (data || []).sort((a, b) => new Date(b.fecha_turno) - new Date(a.fecha_turno));
        setReservas(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar tus reservas.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleCancelar = async (reservaId) => {
    const confirm = window.confirm('¿Estás seguro que querés cancelar esta reserva?');
    if (!confirm) return;

    // Actualización optimista en UI
    const prev = [...reservas];
    setReservas(prev.map(r => (r.id === reservaId || r._id === reservaId) ? { ...r, estado: 'cancelado' } : r));

    try {
      await actualizarReservaParcial(reservaId, { estado: 'cancelado' });
      alert('Reserva cancelada correctamente.');
    } catch (err) {
      // Revertir en caso de error
      setReservas(prev);
      alert('No se pudo cancelar la reserva. Intentá de nuevo.');
      console.error(err);
    }
  };

  if (loading) return <div className="p-4">Cargando reservas...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!reservas.length) return <div className="p-4">No tenés reservas todavía.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Mi Historial de Reservas</h2>
      <div className="space-y-4">
        {reservas.map(r => {
          const id = r.id || r._id;
          const canchaNombre = canchasMap[r.id_cancha] || r.id_cancha;
          return (
            <div key={id} className="p-4 border rounded bg-white shadow-sm flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">{new Date(r.fecha_turno).toLocaleString()}</div>
                <div className="font-medium">{canchaNombre}</div>
                <div className="text-sm text-gray-500">Duración: {r.duracion || '60'} min</div>
                <div className="text-sm">Estado: <span className={r.estado === 'cancelado' ? 'text-red-600' : 'text-green-600'}>{r.estado}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                {r.estado !== 'cancelado' && (
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => handleCancelar(id)}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  className="px-3 py-1 bg-gray-200 rounded"
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(r)) || alert('Detalle copiado')}
                >
                  Copiar detalle
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistorialReservas;