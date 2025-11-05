import { useEffect, useState } from 'react';
import { obtenerReservaUsuario, actualizarReservaParcial } from '../../api/reservas';
import { obtenerCanchas } from '../../api/canchas';
import { useAuth } from '../../context/AuthContext';

const HistorialReservas = () => {
  const { user } = useAuth();
  const [reservas, setReservas] = useState([]);
  const [canchasMap, setCanchasMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const isAdmin = user?.role === 'admin' || (typeof user?.userId === 'string' && user.userId.startsWith('admin-'));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Obtener userId del contexto o localStorage como fallback
        const userId = user?.userId || localStorage.getItem('userId');
        if (!userId) {
          setError('No estás logueado.');
          setLoading(false);
          return;
        }

        // Cargar canchas para mostrar información
        try {
          const canchasData = await obtenerCanchas();
          const map = {};
          (Array.isArray(canchasData) ? canchasData : []).forEach(c => { 
            map[c.id_cancha] = `Cancha ${c.id_cancha}`;
          });
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
    setReservas(prev.map(r => (r.id_turno === reservaId) ? { ...r, estado: 'cancelado' } : r));

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
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">
        {isAdmin ? 'Historial de Todas las Reservas' : 'Mi Historial de Reservas'}
      </h2>
      <div className="space-y-4">
        {reservas.map(r => {
          const canchaNombre = canchasMap[r.id_cancha] || `Cancha ${r.id_cancha}`;
          
          // Formatear fecha y hora correctamente
          const formatearFechaHora = (fecha_turno) => {
            try {
              // Si la fecha viene en formato "YYYY-MM-DD HH:MM:SS", parsearla directamente
              if (typeof fecha_turno === 'string' && fecha_turno.includes(' ')) {
                const [fechaParte, horaParte] = fecha_turno.split(' ');
                const [año, mes, dia] = fechaParte.split('-');
                const [hora, minuto] = horaParte.split(':');
                
                const fechaObj = new Date(año, mes - 1, dia, hora, minuto);
                
                return fechaObj.toLocaleString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              } else {
                // Fallback para otros formatos
                const fecha = new Date(fecha_turno);
                return fecha.toLocaleString('es-AR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                });
              }
            } catch (error) {
              console.error('Error formateando fecha:', error);
              return fecha_turno;
            }
          };
          
          return (
            <div key={r.id_turno} className="p-4 border rounded bg-white shadow-sm flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-600">{formatearFechaHora(r.fecha_turno)}</div>
                <div className="font-medium">{canchaNombre}</div>
                {isAdmin && (
                  <div className="text-sm text-blue-600">
                    Usuario: {r.nombre_usuario || `ID: ${r.id_usuario}`} ({r.email_usuario})
                  </div>
                )}
                <div className="text-sm text-gray-500">Duración: {r.duracion} min</div>
                <div className="text-sm">Precio: ${r.precio?.toLocaleString()}</div>
                <div className="text-sm">Estado: <span className={
                  r.estado === 'cancelado' ? 'text-red-600' : 
                  r.estado === 'completado' ? 'text-blue-600' : 'text-green-600'
                }>{r.estado}</span></div>
              </div>
              <div className="flex flex-col gap-2">
                {r.estado === 'reservado' && (
                  <button
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                    onClick={() => handleCancelar(r.id_turno)}
                  >
                    {isAdmin ? 'Cancelar (Admin)' : 'Cancelar'}
                  </button>
                )}
                <div className="text-xs text-gray-400">
                  ID: {r.id_turno}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistorialReservas;