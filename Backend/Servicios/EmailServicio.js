import nodemailer from 'nodemailer';
import { InternalServerError } from '../utils/errors.js';

// Validar configuración de email
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new InternalServerError('Faltan las credenciales de email en las variables de entorno');
}

// Configuración del transportador de correo
const transporter = nodemailer.createTransport({
    service: 'gmail', // Cambiar según el proveedor de correo
    auth: {
        user: process.env.EMAIL_USER, // Correo electrónico del remitente
        pass: process.env.EMAIL_PASS  // Contraseña o clave de aplicación
    }
});

// Función para enviar correos electrónicos
const enviarCorreo = async ({ destinatario, asunto, contenidoHTML }) => {
    try {
        const opcionesCorreo = {
            from: process.env.EMAIL_USER, // Remitente
            to: destinatario, // Destinatario
            subject: asunto, // Asunto del correo
            html: contenidoHTML // Contenido en formato HTML
        };

        const info = await transporter.sendMail(opcionesCorreo);
        console.log('Correo enviado:', info.messageId);
        return { exito: true, mensaje: 'Correo enviado exitosamente' };
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        return { exito: false, mensaje: 'Error al enviar el correo', error: error.message };
    }
};

export { enviarCorreo };