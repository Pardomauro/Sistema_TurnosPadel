const mysql = require('mysql2/promise');


// Configuracion de la base de datos

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_turnos_padel',
    charset: 'utf8mb4'
}

// Creamos conexion a la base de datos

const createConnection = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Conexión a la base de datos establecida');
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        throw error;
    }

}


// Creamos pool de conexiones

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})


// Funcion para incializar la base de datos (crear tablas si no existen)

const inicializarDataBase = async () => {
    try {
        // Crear base de datos si no existe
        const tempConnection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });

        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await tempConnection.end();

        // Conectar a la base de datos y crear tabla
        const connection = await createConnection();

        // Crear tabla canchas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS canchas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                precio DECIMAL(10, 2) NOT NULL,
                en_mantenimiento BOOLEAN NOT NULL DEFAULT false,
                horarios_disponibles JSON NOT NULL,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);


        // Crear tabla usuarios con columna rol
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id_usuario INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL,
                email VARCHAR(191) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                rol ENUM('usuario', 'administrador') NOT NULL DEFAULT 'usuario',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Asegurarse de que la columna rol exista en caso de que la tabla ya esté creada
        await connection.execute(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS rol ENUM('usuario', 'administrador') NOT NULL DEFAULT 'usuario';
        `);

        // Crear tabla turnos
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS turnos (
                id_turno INT AUTO_INCREMENT PRIMARY KEY,
                id_usuario INT NOT NULL,
                id_cancha INT NOT NULL,
                fecha_turno DATETIME NOT NULL,
                duracion INT NOT NULL, 
                precio DECIMAL(10, 2) NOT NULL,
                estado ENUM('reservado', 'cancelado', 'completado') NOT NULL DEFAULT 'reservado',
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                FOREIGN KEY (id_cancha) REFERENCES canchas(id) ON DELETE CASCADE
            )
        `);

        
        console.log('Tablas "canchas", "usuarios" y "turnos" creadas o ya existentes');
        await connection.end();
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error.message);
        throw error;
    }
}

module.exports = {
    createConnection,
    pool,
    inicializarDataBase
};
