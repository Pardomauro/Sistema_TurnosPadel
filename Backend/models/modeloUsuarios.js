const db = require('../db');

class usuario {
    static async create({ nombre, email, contraseña }) {
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)',
            [nombre, email, contraseña]
        );
        return result.insertId;
    }

    static async findByEmail(email) {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM usuarios WHERE id = ?',
            [id]
        );
        return rows[0];
    }
}

module.exports = usuario;