# 🚀 Setup del Backend - Sistema Turnos Pádel

## 📋 Configuración Inicial para Desarrolladores

### 1. Clonar e Instalar Dependencias
```bash
cd Backend
npm install
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales locales
# IMPORTANTE: Nunca subir .env al repositorio
```

### 3. Configurar Base de Datos MySQL

#### Crear Base de Datos
```sql
CREATE DATABASE sistema_turnos_padel;
USE sistema_turnos_padel;
```

#### Tablas Necesarias (ejecutar en orden)
```sql
-- Tabla usuarios
CREATE TABLE usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') DEFAULT 'usuario',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla canchas
CREATE TABLE canchas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    precio DECIMAL(10,2) NOT NULL,
    en_mantenimiento BOOLEAN DEFAULT FALSE,
    horarios_disponibles JSON,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla turnos
CREATE TABLE turnos (
    id_turno INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    id_cancha INT NOT NULL,
    fecha_turno DATETIME NOT NULL,
    duracion INT NOT NULL COMMENT 'Duración en minutos',
    precio DECIMAL(10,2) NOT NULL,
    estado ENUM('reservado', 'cancelado', 'completado') DEFAULT 'reservado',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_cancha) REFERENCES canchas(id)
);
```

### 4. Configurar Email (Gmail)
1. Activar verificación en 2 pasos en tu cuenta Gmail
2. Generar contraseña de aplicación: [Google Account Settings](https://myaccount.google.com/security)
3. Usar esa contraseña en `EMAIL_PASS`

### 5. Ejecutar el Servidor
```bash
npm start
# o para desarrollo con auto-reload
npm run dev
```

### 6. Verificar Funcionamiento
- Servidor: http://localhost:3000
- Test de conexión BD: http://localhost:3000/api/test (si existe)

## 🔧 Variables de Entorno Explicadas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_PASSWORD` | Contraseña de MySQL local | `mi_password_123` |
| `JWT_SECRET` | Clave para tokens JWT | Generar una clave fuerte |
| `EMAIL_PASS` | Contraseña de aplicación Gmail | No tu contraseña personal |

## 🚨 Reglas Importantes

1. **NUNCA** subir `.env` al repositorio
2. **CADA desarrollador** tiene su propio `.env`
3. **Actualizar** `.env.example` si agregas nuevas variables
4. **Usar** la misma estructura de base de datos
5. **Coordinar** cambios en el schema SQL

## 🤝 Trabajo en Equipo

- Usar `.env.example` como referencia
- Documentar nuevas variables de entorno
- Mantener mismo nombre de base de datos
- Coordinar cambios en estructura de tablas