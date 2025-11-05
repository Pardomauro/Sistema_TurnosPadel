# Sistema de Turnos Pádel

Sistema completo para la gestión de turnos de canchas de pádel con backend en Node.js/Express y frontend en React.

## 🚀 Inicio Rápido

### Opción 1: Iniciar Todo Junto (Recomendado)
```bash
cd Frontend/Frontend-TurnosPadel
npm run dev
```
Este comando inicia automáticamente tanto el backend como el frontend.

### Opción 2: Iniciar por Separado
```bash
# Terminal 1 - Backend
cd Backend
npm run dev

# Terminal 2 - Frontend  
cd Frontend/Frontend-TurnosPadel
npm run frontend
```

## 📋 Scripts Disponibles

### Frontend (Frontend/Frontend-TurnosPadel/)
- `npm run dev` - Inicia backend + frontend simultáneamente
- `npm run frontend` - Solo frontend (Vite dev server)
- `npm run backend` - Solo backend (desde frontend)
- `npm run build` - Build de producción
- `npm run dev:frontend-only` - Solo frontend (alias)
- `npm run dev:backend-only` - Solo backend (alias)

### Backend (Backend/)
- `npm run dev` - Desarrollo con nodemon (reinicio automático)
- `npm start` - Producción con node
- `npm run test:email` - Test del servicio de email

## 🌐 URLs del Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Base de datos**: MySQL (localhost:3306)

## 📁 Estructura del Proyecto

```
Sistema_TurnosPadel/
├── Backend/
│   ├── Config/         # Configuración DB
│   ├── Rutas/          # Endpoints API
│   ├── Servicios/      # Servicios (email, auth)
│   ├── utils/          # Utilidades
│   ├── .env            # Variables de entorno
│   └── app.js          # Servidor principal
└── Frontend/
    └── Frontend-TurnosPadel/
        ├── src/
        │   ├── api/           # Funciones API
        │   ├── components/    # Componentes React
        │   ├── utils/         # Utilidades frontend
        │   └── App.jsx        # App principal
        └── package.json
```

## 🔧 Configuración de Base de Datos

El sistema creará automáticamente:
- Base de datos: `sistema_turnos_padel`
- Tablas: `usuarios`, `canchas`, `turnos`
- Datos de prueba: 4 canchas con horarios

## 📊 API Endpoints Principales

### Canchas
- `GET /api/canchas` - Listar todas las canchas
- `GET /api/canchas/:id` - Obtener cancha específica
- `POST /api/canchas` - Crear nueva cancha
- `PUT /api/canchas/:id` - Actualizar cancha
- `DELETE /api/canchas/:id` - Eliminar cancha

### Usuarios
- `POST /usuarios/registro` - Registrar usuario
- `POST /usuarios/login` - Iniciar sesión
- `GET /usuarios` - Listar usuarios (admin)

### Turnos
- `GET /api/turnos` - Listar turnos
- `POST /api/turnos` - Crear nueva reserva
- `PUT /api/turnos/:id` - Actualizar turno
- `DELETE /api/turnos/:id` - Cancelar turno

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js + Express
- MySQL2
- JWT (autenticación)
- Nodemailer (emails)
- Bcrypt (encriptación)

### Frontend  
- React 18
- React Router DOM
- Tailwind CSS
- Vite (build tool)

## 🚨 Resolución de Problemas

### Error de Conexión Backend
1. Verificar que MySQL esté corriendo
2. Revisar credenciales en `.env`
3. Verificar puerto 3000 disponible

### Error de Dependencias
```bash
# Frontend
cd Frontend/Frontend-TurnosPadel
npm install

# Backend  
cd Backend
npm install
```

### Errores de CORS
El backend está configurado para aceptar requests desde `http://localhost:5173`

## 👥 Desarrolladores
- Mauro Pardo
- Ezequiel Grasso