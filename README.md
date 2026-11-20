# CuidARTE Chile - Plataforma de Gestión para Cuidadores Informales

## 📌 Descripción del Proyecto
CuidARTE Chile es una solución tecnológica diseñada para apoyar a cuidadores informales y familias en la gestión clínica, seguimiento de tratamientos farmacológicos y programación de citas médicas para personas bajo cuidado con dependencia severa.

---

## 🛠️ Arquitectura del Sistema
El sistema utiliza una arquitectura por capas responsiva y escalable:

* **Frontend:** React.js (Vite) con CSS propio, responsive y sin frameworks de estilos, para una interfaz intuitiva y accesible.
* **Backend:** Node.js con Express para la implementación de la API REST.
* **Base de Datos:** PostgreSQL (SGBD Relacional) con un esquema optimizado en **Tercera Forma Normal (3FN)**.

---

## 🗄️ Modelo de Base de Datos y Normalización (3FN)
La base de datos relacional `cuidarte_db` consta de 6 tablas principales con integridad referencial garantizada a través de claves primarias (PK) y foráneas (FK):

1. **`usuarios`**: Perfiles de acceso y datos de los cuidadores principales.
2. **`pacientes`**: Ficha de identificación, nivel de dependencia y dirección del paciente.
3. **`citas_medicas`**: Agenda de atenciones, especialidades y profesionales de salud.
4. **`tratamientos`**: Registro de esquemas terapéuticos, horarios y dosificación.
5. **`medicamentos`**: Fármacos específicos asociados a cada tratamiento.
6. **`beneficios`**: Registro de apoyos estatales y subsidios (ej. programa Chile Cuida).

---

## 📁 Estructura del Repositorio
```text
cuidarte-chile/
├── backend/             # API REST (Node.js + Express)
│   ├── middleware/      # auth.js (verificación de JWT)
│   ├── routes/          # usuarios, pacientes, citas, tratamientos
│   ├── db.js            # Conexión a PostgreSQL
│   ├── index.js         # Punto de entrada del servidor
│   └── .env.example     # Plantilla de variables de entorno
├── frontend/            # Interfaz gráfica de usuario (React + Vite)
├── database/
│   └── schema.sql       # Creación de tablas (3FN), PK/FK
├── postman/             # Colección de pruebas de la API
└── README.md            # Documentación técnica del proyecto
```

---

## 🚀 Instalación y puesta en marcha

### Requisitos previos
- Node.js 20 o superior (desarrollado y probado con v24.12.0)
- PostgreSQL y pgAdmin 4
- Git

### 1. Clonar el repositorio
```bash
git clone https://github.com/Loredino/cuidarte-chile.git
cd cuidarte-chile
```

### 2. Base de datos
1. En pgAdmin 4, crear una base de datos llamada `cuidarte_db`.
2. Abrir el Query Tool sobre esa base y ejecutar `database/schema.sql`.
3. Verificar que se crearon las 6 tablas (Schemas > public > Tables).

### 3. Backend
```bash
cd backend
npm install
copy .env.example .env
```

Completar el archivo `.env`:

| Variable | Descripción |
|----------|-------------|
| `DB_HOST` | Host de PostgreSQL (`localhost`) |
| `DB_PORT` | Puerto de PostgreSQL (`5432`) |
| `DB_USER` | Usuario de PostgreSQL (`postgres`) |
| `DB_PASSWORD` | Contraseña del usuario de PostgreSQL |
| `DB_NAME` | Nombre de la base de datos (`cuidarte_db`) |
| `PORT` | Puerto del servidor (`3000`) |
| `JWT_SECRET` | Clave secreta para firmar los tokens (texto largo y difícil de adivinar) |

Iniciar el servidor:
```bash
node index.js
```
La API queda en `http://localhost:3000`.

### 4. Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
La aplicación queda en `http://localhost:5173`.

---

## 🔌 Endpoints principales

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/usuarios/registro` | Público |
| POST | `/api/usuarios/login` | Público |
| GET / POST | `/api/pacientes` | Requiere token |
| GET / POST | `/api/citas` | Requiere token |
| GET | `/api/tratamientos` | Requiere token |
| POST | `/api/tratamientos-completos` | Requiere token (transacción) |

Las rutas protegidas requieren el header `Authorization: Bearer <token>`.
La colección de Postman está en la carpeta `postman/`.

---

## 🔒 Seguridad
- Contraseñas almacenadas con hash (bcrypt).
- Autenticación con JWT; el `id_usuario` se obtiene del token, nunca del cuerpo de la petición.
- El archivo `.env` no se sube al repositorio (ver `.gitignore`).