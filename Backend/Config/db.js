
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
