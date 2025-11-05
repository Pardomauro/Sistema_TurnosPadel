# 🧪 Tests básicos para verificar las APIs

## Endpoints disponibles para probar:

### 📊 **Usuarios**
- `GET http://localhost:3000/api/usuarios` - Obtener todos los usuarios
- `GET http://localhost:3000/api/usuarios/1` - Obtener usuario por ID
- `POST http://localhost:3000/api/usuarios/registrar` - Registrar nuevo usuario
- `POST http://localhost:3000/api/usuarios/login` - Iniciar sesión

### 🏓 **Canchas**
- `GET http://localhost:3000/api/canchas` - Obtener todas las canchas
- `GET http://localhost:3000/api/canchas/disponibles` - Obtener canchas disponibles
- `POST http://localhost:3000/api/canchas` - Crear nueva cancha (admin)

### 📅 **Turnos**
- `GET http://localhost:3000/api/turnos` - Obtener todos los turnos
- `POST http://localhost:3000/api/turnos` - Crear nueva reserva
- `GET http://localhost:3000/api/turnos/fecha/2025-11-04` - Turnos por fecha

## 🔧 **Ejemplo de prueba rápida:**

### Registrar un usuario:
```json
POST http://localhost:3000/api/usuarios/registrar
Content-Type: application/json

{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "password": "123456"
}
```

### Crear una cancha:
```json
POST http://localhost:3000/api/canchas
Content-Type: application/json

{
    "precio": 1500,
    "en_mantenimiento": false,
    "horarios_disponibles": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
}
```

## 📝 **Herramientas recomendadas:**
- Thunder Client (extensión de VS Code)
- Postman
- Insomnia
- O directamente desde el navegador para los GET