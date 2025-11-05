import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../auth/ProtectedRoute';
import Login from '../usuarios/login';
import Registro from '../usuarios/registro';
import AdminLogin from '../usuarios/admin-login';


import Unauthorized from '../auth/Unauthorized';
import AdminDashboard from '../admin/AdminDashboard';
import HistorialReservas from '../reservas/HistorialReservas.jsx';
import ReservarCancha from '../reservas/ReservarCancha.jsx';
import NuevaReservaUsuario from '../reservas/NuevaReservaUsuario.jsx';
import ListaCanchas from '../canchas/lista.jsx';
import DetalleCancha from '../canchas/detalle.jsx';
import CrearEditarCancha from '../canchas/crear-editar.jsx';
import GestionUsuarios from '../admin/GestionUsuarios.jsx';
import NuevaReserva from '../admin/NuevaReserva.jsx';
import RecuperarPassword from '../usuarios/RecuperarPassword.jsx';
import RestablecerPassword from '../usuarios/RestablecerPassword.jsx';
import Perfil from '../usuarios/perfil.jsx';

export default function RutasApp() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Redirigir la raíz según autenticación */}
            <Route path="/" element={
                isAuthenticated() ? <Navigate to="/canchas" replace /> : <Navigate to="/login" replace />
            } />
            
            {/* Rutas Públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/recuperar-password" element={<RecuperarPassword />} />
            <Route path="/restablecer-password" element={<RestablecerPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Rutas Protegidas para Usuarios */}
            <Route path="/canchas" element={
                <ProtectedRoute>
                    <ListaCanchas />
                </ProtectedRoute>
            } />
            <Route path="/canchas/:id" element={
                <ProtectedRoute>
                    <DetalleCancha />
                </ProtectedRoute>
            } />
            
            {/* Rutas Protegidas para Admin */}
            <Route path="/admin" element={
                <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/canchas/crear" element={
                <ProtectedRoute requireAdmin={true}>
                    <CrearEditarCancha />
                </ProtectedRoute>
            } />
            <Route path="/canchas/editar/:id" element={
                <ProtectedRoute requireAdmin={true}>
                    <CrearEditarCancha />
                </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
                <ProtectedRoute requireAdmin={true}>
                    <GestionUsuarios />
                </ProtectedRoute>
            } />
            <Route path="/admin/nueva-reserva" element={
                <ProtectedRoute requireAdmin={true}>
                    <NuevaReserva />
                </ProtectedRoute>
            } />

            {/* Rutas de Reservas */}
            <Route path="/reservas/historial" element={
                <ProtectedRoute>
                    <HistorialReservas />
                </ProtectedRoute>
            } />
            <Route path="/reservas/nueva/:id" element={
                <ProtectedRoute>
                    <NuevaReservaUsuario />
                </ProtectedRoute>
            } />
            <Route path="/reservar/:id" element={
                <ProtectedRoute>
                    <ReservarCancha />
                </ProtectedRoute>
            } />

            {/* Ruta de Perfil de Usuario */}
            <Route path="/perfil" element={
                <ProtectedRoute>
                    <Perfil />
                </ProtectedRoute>
            } />

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