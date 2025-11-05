import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay un token guardado al cargar la aplicación
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const userRole = localStorage.getItem('userRole');

        console.log('AuthContext - Datos encontrados en localStorage:', { token, userId, userRole });

        if (token && userId && userRole) {
            // Verificar si el token es válido (no es un token temporal de prueba)
            if (token === 'temp-token' || token.startsWith('admin-token-temp') || userId === 'admin-1') {
                console.log('AuthContext - Token temporal detectado, limpiando localStorage');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
            } else {
                // TODO: En el futuro, validar token con el backend
                console.log('AuthContext - Estableciendo usuario como autenticado');
                setUser({
                    userId: userId,
                    role: userRole,
                    token: token
                });
            }
        } else {
            console.log('AuthContext - No hay datos válidos, usuario no autenticado');
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('userId', userData.userId);
        localStorage.setItem('userRole', userData.role);
    };

    const logout = () => {
        console.log('AuthContext - Ejecutando logout');
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
    };

    const isAuthenticated = () => {
        return !!user;
    };

    const isAdmin = () => {
        return user?.role === 'admin' || user?.role === 'administrador';
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};