import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearReserva, obtenerTurnosDisponibles } from '../../api/reservas';
import { obtenerCanchas } from '../../api/canchas';

const FormularioReserva = () => {
	const navigate = useNavigate();
	const [slot, setSlot] = useState(null);
	const [canchas, setCanchas] = useState([]);
	const [form, setForm] = useState({
		id_cancha: '',
		duracion: 60,
		precio: 0,
		nombre: '',
		email: '',
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const s = localStorage.getItem('selectedSlot');
		if (s) {
			try {
				const parsed = JSON.parse(s);
				setSlot(parsed);
				if (parsed.id_cancha) setForm((f) => ({ ...f, id_cancha: parsed.id_cancha }));
			} catch (e) {
				console.error('selectedSlot parse error', e);
			}
		}

		const loadCanchas = async () => {
			try {
				const data = await obtenerCanchas();
				setCanchas(data);
				if (data && data.length && !form.id_cancha) {
					setForm((f) => ({ ...f, id_cancha: data[0].id || data[0]._id }));
				}
			} catch (err) {
				console.error('Error cargando canchas', err);
			}
		};

		loadCanchas();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!slot) {
			setError('No hay un turno seleccionado. Seleccioná un horario en el calendario.');
			return;
		}

		if (!form.id_cancha) {
			setError('Seleccioná una cancha');
			return;
		}

		const reservaPayload = {
			id_usuario: localStorage.getItem('userId') || null,
			id_cancha: form.id_cancha,
			fecha_turno: new Date(slot.start).toISOString().slice(0,19).replace('T',' '),
			duracion: Number(form.duracion),
			precio: Number(form.precio) || 0,
			estado: 'reservado',
			email: form.email,
			nombre: form.nombre,
		};

		setLoading(true);
		try {
			const disponibilidad = await obtenerTurnosDisponibles(reservaPayload.fecha_turno.split(' ')[0], form.id_cancha);
			const conflicto = (disponibilidad || []).some(t => t.fecha_turno === reservaPayload.fecha_turno && (t.id_cancha == reservaPayload.id_cancha || t.id_cancha == (reservaPayload.id_cancha)) && t.estado === 'reservado');
			if (conflicto) {
				setError('La cancha ya está ocupada en ese horario. Por favor elegí otro turno.');
				setLoading(false);
				return;
			}

			await crearReserva(reservaPayload);
			setSuccess('Reserva creada correctamente');
			localStorage.removeItem('selectedSlot');
			setTimeout(() => navigate('/reservas/historial'), 1000);
		} catch (err) {
			console.error('Error creando reserva', err);
			setError(err.message || 'Error al crear la reserva');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
			<h2 className="text-2xl font-bold mb-4">Confirmar Reserva</h2>

			{error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4">{error}</div>}
			{success && <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-4">{success}</div>}

			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Fecha / Hora seleccionada</label>
					<input type="text" readOnly value={slot ? new Date(slot.start).toLocaleString() : 'No seleccionado'} className="w-full px-3 py-2 border rounded bg-gray-100" />
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Cancha</label>
					<select name="id_cancha" value={form.id_cancha} onChange={handleChange} className="w-full px-3 py-2 border rounded">
						{canchas.map(c => (
							<option key={c.id || c._id} value={c.id || c._id}>{c.nombre || `Cancha ${c.id || c._id}`}</option>
						))}
					</select>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Duración (min)</label>
					<select name="duracion" value={form.duracion} onChange={handleChange} className="w-full px-3 py-2 border rounded">
						<option value={60}>60</option>
						<option value={90}>90</option>
						<option value={120}>120</option>
					</select>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Precio</label>
					<input name="precio" value={form.precio} onChange={handleChange} type="number" className="w-full px-3 py-2 border rounded" />
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-1">Nombre</label>
					<input name="nombre" value={form.nombre} onChange={handleChange} type="text" className="w-full px-3 py-2 border rounded" />
				</div>

				<div className="mb-6">
					<label className="block text-sm font-medium mb-1">Email</label>
					<input name="email" value={form.email} onChange={handleChange} type="email" className="w-full px-3 py-2 border rounded" />
				</div>

				<button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 px-4 rounded">
					{loading ? 'Reservando...' : 'Confirmar Reserva'}
				</button>
			</form>
		</div>
	);
};

export default FormularioReserva;