import { pool } from '../Config/db.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

/**
 * Script para crear o actualizar el usuario administrador
 * 
 * Uso:
 * - Crear/verificar admin: node scripts/crearAdmin.js
 * - Actualizar password: node scripts/crearAdmin.js --actualizar
 * 
 * Configuración: Lee credenciales desde .env (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME)
 */
async function crearUsuarioAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'sistematurnos2025@gmail.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Sistematurnos2025.@';
        const adminName = process.env.ADMIN_NAME || 'Administrador Sistema';

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

        console.log('\n Credenciales para usar en Postman o frontend:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);

        await pool.end();
        console.log('\nProceso completado');
        
    } catch (error) {
        console.error('Error al crear/actualizar usuario administrador:', error.message);
        process.exit(1);
    }
}

// Ejecutar script
crearUsuarioAdmin();