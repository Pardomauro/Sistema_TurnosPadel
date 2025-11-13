import { pool } from '../Config/db.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

/**
 * Script para crear o actualizar el usuario administrador
 * 
 * IMPORTANTE: Configurar variables de entorno obligatorias en .env:
 * - ADMIN_EMAIL=tu_email@gmail.com
 * - ADMIN_PASSWORD=tu_contraseña_segura
 * - ADMIN_NAME=Nombre Administrador (opcional)
 * 
 * Uso:
 * - Crear/verificar admin: node scripts/crearAdmin.js
 * - Actualizar password: node scripts/crearAdmin.js --actualizar
 * 
 * SEGURIDAD: NUNCA incluir credenciales directamente en el código
 */
async function crearUsuarioAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || 'Administrador Sistema';

        // Validar que las credenciales estén configuradas
        if (!adminEmail || !adminPassword) {
            console.error('❌ ERROR: Variables de entorno obligatorias no configuradas');
            console.error('');
            console.error('Debes configurar las siguientes variables en tu archivo .env:');
            console.error('   ADMIN_EMAIL=tu_email_admin@gmail.com');
            console.error('   ADMIN_PASSWORD=tu_contraseña_segura');
            console.error('   ADMIN_NAME=Nombre del Administrador (opcional)');
            console.error('');
            console.error('NUNCA incluyas credenciales directamente en el código por seguridad.');
            process.exit(1);
        }

        console.log('Verificando si el usuario administrador existe...');
        console.log(`Email: ${adminEmail}`);

        // Verificar si el usuario ya existe
        const [usuarioExistente] = await pool.execute(
            'SELECT id_usuario, nombre, email, rol FROM usuarios WHERE email = ?',
            [adminEmail]
        );

        if (usuarioExistente.length > 0) {
            console.log('Usuario administrador ya existe:');
            console.log(`   ID: ${usuarioExistente[0].id_usuario}`);
            console.log(`   Nombre: ${usuarioExistente[0].nombre}`);
            console.log(`   Email: ${usuarioExistente[0].email}`);
            console.log(`   Rol: ${usuarioExistente[0].rol}`);

            // Verificar si necesita actualizar la contraseña
            const actualizar = process.argv.includes('--actualizar') || process.argv.includes('-u');
            if (actualizar) {
                console.log(' Actualizando contraseña del administrador...');
                const hashedPassword = await bcrypt.hash(adminPassword, 10);
                
                await pool.execute(
                    'UPDATE usuarios SET password = ?, nombre = ?, rol = ? WHERE email = ?',
                    [hashedPassword, adminName, 'administrador', adminEmail]
                );
                
                console.log('Contraseña del administrador actualizada correctamente');
            }
        } else {
            console.log(' Creando nuevo usuario administrador...');
            
            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            // Insertar el nuevo usuario
            const [resultado] = await pool.execute(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [adminName, adminEmail, hashedPassword, 'administrador']
            );
            
            console.log('Usuario administrador creado exitosamente:');
            console.log(`   ID: ${resultado.insertId}`);
            console.log(`   Nombre: ${adminName}`);
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Rol: administrador`);
        }

        console.log('\n🔐 Credenciales configuradas correctamente en variables de entorno');
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`👤 Nombre: ${adminName}`);
        console.log('🔒 Password: [PROTEGIDA - No se muestra por seguridad]');

        await pool.end();
        console.log('\nProceso completado');
        
    } catch (error) {
        console.error('Error al crear/actualizar usuario administrador:', error.message);
        process.exit(1);
    }
}

// Ejecutar script
crearUsuarioAdmin();