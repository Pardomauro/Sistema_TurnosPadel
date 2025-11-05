# Scripts de Administración

Esta carpeta contiene scripts útiles para la administración del sistema.

## Scripts Disponibles

### 🔧 `crearAdmin.js`
**Propósito:** Crear o actualizar el usuario administrador del sistema.

**Uso:**
```bash
# Crear/verificar administrador
node scripts/crearAdmin.js

# Actualizar contraseña del administrador
node scripts/crearAdmin.js --actualizar
```

**Configuración:** Lee las credenciales desde las variables de entorno:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` 
- `ADMIN_NAME`



## Notas

- Todos los scripts requieren que el servidor de base de datos esté corriendo
- Los scripts verifican si los usuarios ya existen antes de crearlos
- Las contraseñas se almacenan hasheadas con bcrypt
- Los scripts usan las mismas configuraciones de base de datos que la aplicación principal

## Ejemplo de Flujo de Trabajo

1. **Configurar administrador:**
   ```bash
   node scripts/crearAdmin.js
   ```
