import { Routes, Route } from 'react-router-dom';
import HistorialReservas from '../reservas/historial.jsx';
import ListaCanchas from '../canchas/lista.jsx';
import DetalleCancha from '../canchas/detalle.jsx';
import CrearEditarCancha from '../canchas/crear-editar.jsx';

export default function RutasApp() {
    return (
        <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<ListaCanchas />} />
            
            {/* Rutas de Canchas */}
            <Route path="/canchas" element={<ListaCanchas />} />
            <Route path="/canchas/crear" element={<CrearEditarCancha />} />
            <Route path="/canchas/:id" element={<DetalleCancha />} />
            <Route path="/canchas/editar/:id" element={<CrearEditarCancha />} />

            {/* Rutas de Reservas */}
            <Route path="/reservas/historial" element={<HistorialReservas />} />

            {/* Ruta 404 - No encontrado */}
            <Route path="*" element={
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold text-gray-700">Página no encontrada</h2>
                    <p className="text-gray-600 mt-2">La página que buscas no existe.</p>
                </div>
            } />
        </Routes>
    );
}