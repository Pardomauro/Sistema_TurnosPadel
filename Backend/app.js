const express = require('express');
const cors = require('cors');
const { inicializarDataBase } = require('./Config/db');


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', require('./Rutas/Turnos'));
app.use('/api', require('./Rutas/Usuario'));
app.use('/api', require('./Rutas/Canchas'));

// Middleware para manejar errores 404 (ruta no encontrada)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

// Inicializar la base de datos y luego iniciar el servidor
const iniciarServidor = async () => {
    try {
        await inicializarDataBase();
        app.listen(PORT, () => {
            console.log(`Servidor en ejecución en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo iniciar el servidor debido a un error en la base de datos:', error);
        process.exit(1);
    }

};


module.exports = { app, iniciarServidor };