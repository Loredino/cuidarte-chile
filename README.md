# CuidARTE Chile

Aplicación web que ayuda a cuidadores informales de personas mayores o dependientes en Chile a organizar sus cuidados: pacientes, citas médicas, tratamientos con medicamentos, dosis del día y beneficios del programa Chile Cuida.

Proyecto de título · Técnico Analista Programador · IPLACEX.

**Sistema en línea:** https://cuidarte-chile.onrender.com
(el servicio es gratuito y se suspende por inactividad; el primer acceso puede tardar cerca de un minuto).
Las credenciales de los dos perfiles de prueba están en el informe final.

## Tecnologías

- **Backend:** Node.js, Express 5, PostgreSQL (`pg`), JWT y bcrypt.
- **Frontend:** React 19 con Vite.
- **Base de datos:** PostgreSQL, modelo en 3FN con seis tablas.
- **Hosting:** Render (aplicación) y Neon (base de datos).

## Funcionalidades

- Registro e inicio de sesión con contraseñas cifradas y token JWT.
- Dos perfiles: **Cuidador Principal** y **Administrador**.
- Gestión de pacientes, citas médicas, tratamientos con medicamentos y beneficios.
- Resumen con las dosis del día, calculadas con la hora de la primera dosis y la frecuencia.
- Administración de usuarios (listar, activar y desactivar), solo para el perfil Administrador.
- Cada cuidador ve únicamente sus propios datos.

## Estructura del repositorio

```
backend/    API REST (Express): rutas, middleware y conexión a la base de datos
frontend/   Interfaz en React + Vite
database/   schema.sql: crea las tablas y carga datos de ejemplo
postman/    Colección de pruebas de la API
```

## Instalación local

Requisitos: Node.js 22, PostgreSQL y Git.

1. Clonar el repositorio y entrar a la carpeta del proyecto.

2. Crear la base de datos y cargar el esquema. **Atención:** `schema.sql` borra las tablas antes de crearlas; no lo ejecutes sobre una base con datos reales.

   ```bash
   psql -U postgres -c "CREATE DATABASE cuidarte_db"
   psql -U postgres -d cuidarte_db -f database/schema.sql
   ```

3. Configurar las variables de entorno: copiar `backend/.env.example` como `backend/.env` y completar los valores (contraseña de PostgreSQL y `JWT_SECRET`). El archivo `.env` no se sube al repositorio.

4. Iniciar la API:

   ```bash
   cd backend
   npm install
   node index.js
   ```

   La API queda en http://localhost:3000.

5. Iniciar la interfaz (en otra terminal):

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   La interfaz queda en http://localhost:5173.

## Variables de entorno

| Variable | Uso |
|---|---|
| `PORT` | Puerto del servidor (en Render lo define la plataforma) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Base de datos local |
| `DATABASE_URL` | Base de datos en la nube (Neon). Si existe, reemplaza a las variables `DB_*` |
| `JWT_SECRET` | Clave con la que se firman los tokens |

## Despliegue

El backend y el frontend se publican juntos en un único servicio web de Render. Express sirve el frontend compilado (`frontend/dist`) y la API bajo `/api`.

- **Build command:** `npm install --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend`
- **Start command:** `node backend/index.js`
- **Variables en Render:** `DATABASE_URL`, `JWT_SECRET` y `NODE_VERSION=22`.
- **Base de datos:** proyecto en Neon, creado ejecutando `database/schema.sql` en su SQL Editor.

## Pruebas

El sistema se probó manualmente: 18 casos de prueba con la colección de Postman de la carpeta `postman/` y con la interfaz. El detalle está en el informe final.

## Limitaciones conocidas

- No hay pruebas automatizadas.
- El token de un usuario desactivado sigue siendo válido hasta 8 horas.
- Las dosis con frecuencia de 24 horas o más muestran solo la hora ancla.
- El módulo de visitas domiciliarias quedó como trabajo futuro.