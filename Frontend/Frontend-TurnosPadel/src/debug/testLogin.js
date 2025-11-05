// Script de prueba para verificar la comunicación frontend-backend
// Ejecutar en la consola del navegador

async function probarLogin() {
    console.log('🔍 Probando login desde el frontend...');
    
    const email = 'sistematurnos2025@gmail.com';
    const password = 'Sistematurnos2025.@';
    
    try {
        console.log('📡 Enviando petición de login...');
        console.log(`Email: ${email}`);
        
        const response = await fetch('http://localhost:3000/api/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('📥 Respuesta recibida:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login exitoso:', data);
            
            // Guardar en localStorage como lo hace el frontend
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('userRole', data.role);
            
            console.log('💾 Datos guardados en localStorage:');
            console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
            console.log('UserId:', localStorage.getItem('userId'));
            console.log('UserRole:', localStorage.getItem('userRole'));
            
            return data;
        } else {
            const error = await response.json();
            console.error('❌ Error en login:', error);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de red:', error);
        return null;
    }
}

// Función para limpiar localStorage
function limpiarDatos() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    console.log('🧹 LocalStorage limpiado');
}

// Función para verificar estado actual
function verificarEstado() {
    console.log('📊 Estado actual del localStorage:');
    console.log('Token:', localStorage.getItem('token'));
    console.log('UserId:', localStorage.getItem('userId'));
    console.log('UserRole:', localStorage.getItem('userRole'));
}

console.log('🎯 Scripts de debugging disponibles:');
console.log('- probarLogin() - para probar el login desde consola');
console.log('- verificarEstado() - para ver el estado del localStorage');
console.log('- limpiarDatos() - para limpiar el localStorage');
console.log('- Solo para desarrollo/debugging');