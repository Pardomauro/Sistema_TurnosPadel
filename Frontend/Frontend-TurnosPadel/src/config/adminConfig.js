// Configuración de credenciales de administrador
// IMPORTANTE: Las credenciales ahora están en la base de datos y variables de entorno
// Este archivo solo mantiene configuraciones de seguridad y funciones auxiliares

export const ADMIN_CONFIG = {
  // NOTA: Las credenciales del administrador ahora están en la base de datos
  // Para acceder como admin, usar el endpoint de login normal con:
  // Email: sistematurnos2025@gmail.com
  // Password: Sistematurnos2025.@
  DEFAULT_ADMIN: {
    // Estas credenciales ya no se usan - mantenidas solo para referencia
    email: 'sistematurnos2025@gmail.com',
    password: '*** MOVIDO A BASE DE DATOS ***',
    name: 'AdministradorSistema'
  },

  // Configuración de seguridad
  SECURITY: {
    // Tiempo de expiración de token admin (en milisegundos)
    TOKEN_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24 horas
    
    // Intentos máximos de login
    MAX_LOGIN_ATTEMPTS: 3,
    
    // Tiempo de bloqueo después de intentos fallidos (en milisegundos)
    LOCKOUT_TIME: 15 * 60 * 1000 // 15 minutos
  }
};

// Función para validar credenciales de admin
export const validateAdminCredentials = (email, password) => {
  return email === ADMIN_CONFIG.DEFAULT_ADMIN.email && 
         password === ADMIN_CONFIG.DEFAULT_ADMIN.password;
};

// Función para generar token temporal de admin
export const generateAdminToken = () => {
  return `admin-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};