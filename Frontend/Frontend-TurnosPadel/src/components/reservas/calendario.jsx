import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { obtenerReservas } from '../../api/reservas';
import { useNavigate } from 'react-router-dom';

const locales = { 'es': es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendario = () => {
  const [eventos, setEventos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTurnos = async () => {
      try {
        const data = await obtenerReservas();
      
        const mapped = (data || []).map((t) => {
          const start = parse(t.fecha_turno, 'yyyy-MM-dd HH:mm:ss', new Date());
          const end = addMinutes(start, Number(t.duracion || 60));
          return {
            id: t.id || t._id,
            title: t.estado === 'reservado' ? `Ocupado - Cancha ${t.id_cancha}` : `Disponible - Cancha ${t.id_cancha}`,
            start,
            end,
            allDay: false,
            recurso: t.id_cancha,
            estado: t.estado || 'disponible',
            raw: t,
          };
        });
        setEventos(mapped);
      } catch (err) {
        console.error('Error cargando turnos:', err);
      }
    };

    loadTurnos();
   
  }, []);

  const eventStyleGetter = (event) => {
    const style = {
      borderRadius: '6px',
      border: 'none',
      color: 'white',
      padding: '2px 6px',
    };

    if (event.estado === 'reservado') {
      style.backgroundColor = '#ef4444'; 
    } else {
      style.backgroundColor = '#10b981'; 
    }
    return { style };
  };

  const handleSelectSlot = (slotInfo) => {
   
    const payload = {
      start: slotInfo.start.toISOString(),
      end: slotInfo.end.toISOString(),
    };
    localStorage.setItem('selectedSlot', JSON.stringify(payload));
    navigate('/reservas/formulario');
  };

  const handleSelectEvent = (event) => {
    if (event.estado === 'reservado') {
      alert('Este turno ya está reservado.');
      return;
    }
  
    const payload = {
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      id_cancha: event.recurso,
    };
    localStorage.setItem('selectedSlot', JSON.stringify(payload));
    navigate('/reservas/formulario');
  };

  return (
    <div className="h-[600px] p-4">
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="es"
        messages={{
          next: 'Siguiente',
          previous: 'Anterior',
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          day: 'Día',
        }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default Calendario;

