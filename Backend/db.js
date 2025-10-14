const mysql = require('mysql2/promise');
const express = require('express');

const db = mysql.createPool({
    host: 'localhost',
    user: 'Mauro-Eze',
    password: 'Mauro-Eze123',
    database: 'nombre_base_de_datos'
});

const app = express();
app.use(express.json());

const userRoutes = require('./routes/rutasUsuarios');
app.use('/usuarios', userRoutes);

module.exports = { db, app };