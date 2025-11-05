import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function NavBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAuthenticated, isAdmin } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const closeUserMenu = () => {
        setIsUserMenuOpen(false);
    };

    // No mostrar navbar en la página de login
    if (location.pathname === '/login') {
        return null;
    }

    return (
        <nav className="bg-blue-800 text-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3 sm:py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="text-xl sm:text-2xl font-bold">🎾</div>
                        <Link to="/" className="text-lg sm:text-xl font-bold hover:text-blue-200">
                            <span className="hidden sm:inline">Sistema Turnos Pádel</span>
                            <span className="sm:hidden">Turnos Pádel</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    {isAuthenticated() && (
                        <div className="hidden md:flex space-x-6">
                            {isAdmin() && (
                                <Link
                                    to="/admin"
                                    className={`hover:text-blue-200 transition-colors ${isActive('/admin') ? 'text-blue-200 font-semibold' : ''
                                        }`}
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                to="/canchas"
                                className={`hover:text-blue-200 transition-colors ${isActive('/canchas') || isActive('/') ? 'text-blue-200 font-semibold' : ''
                                    }`}
                            >
                                Canchas
                            </Link>

                            <Link
                                to="/reservas/historial"
                                className={`hover:text-blue-200 transition-colors ${isActive('/reservas/historial') ? 'text-blue-200 font-semibold' : ''
                                    }`}
                            >
                                Reservas
                            </Link>




                        </div>
                    )}

                    {/* Desktop User Menu */}
                    {isAuthenticated() && (
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="relative">
                                <button
                                    onClick={toggleUserMenu}
                                    className="flex items-center space-x-2 text-sm hover:text-blue-200 transition-colors"
                                >
                                    <span>👤</span>
                                    <span>{isAdmin() ? 'Administrador' : 'Usuario'}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <Link
                                            to="/perfil"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={closeUserMenu}
                                        >
                                            👤 Mi Perfil
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                closeUserMenu();
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                        >
                                            🚪 Cerrar Sesión
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    {isAuthenticated() && (
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mobile Menu */}
                {isAuthenticated() && isMobileMenuOpen && (
                    <div className="md:hidden border-t border-blue-500 py-3">
                        <div className="flex flex-col space-y-3">

                            {isAdmin() && (
                                <Link
                                    to="/admin"
                                    className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/admin') ? 'bg-blue-700 font-semibold' : ''
                                        }`}
                                    onClick={closeMobileMenu}
                                >
                                    Admin
                                </Link>
                            )}


                            <Link
                                to="/reservas/historial"
                                className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/reservas/historial') ? 'bg-blue-700 font-semibold' : ''
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                Reservas
                            </Link>

                            <Link
                                to="/canchas"
                                className={`px-3 py-2 rounded hover:bg-blue-700 transition-colors ${isActive('/canchas') || isActive('/') ? 'bg-blue-700 font-semibold' : ''
                                    }`}
                                onClick={closeMobileMenu}
                            >
                                Canchas
                            </Link>



                            {/* Mobile User Info */}
                            <div className="px-3 py-2 border-t border-blue-500 mt-2">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm">
                                        {isAdmin() ? 'Administrador' : 'Usuario'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <Link
                                        to="/perfil"
                                        className="block bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition-colors w-full text-center"
                                        onClick={closeMobileMenu}
                                    >
                                        👤 Mi Perfil
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm transition-colors w-full"
                                    >
                                        🚪 Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}