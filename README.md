# CuidARTE Chile - Plataforma de Gestión para Cuidadores Informales

## 📌 Descripción del Proyecto
CuidARTE Chile es una solución tecnológica diseñada para apoyar a cuidadores informales y familias en la gestión clínica, seguimiento de tratamientos farmacológicos y programación de citas médicas para personas bajo cuidado con dependencia severa.

---

## 🛠️ Arquitectura del Sistema
El sistema utiliza una arquitectura por capas responsiva y escalable:

* **Frontend:** React.js con componentes Bootstrap y Tailwind CSS para una interfaz intuitiva y accesible.
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
├── backend/            # API REST (Node.js + Express)
├── frontend/           # Interfaz gráfica de usuario (React.js)
├── database/           # Scripts SQL y diseño del modelo relacional
│   ├── schema.sql      # Script de creación de tablas (3FN), PK/FK y datos iniciales (seed)
└── README.md           # Documentación técnica del proyecto