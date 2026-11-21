-- =====================================================================
-- CuidARTE Chile - Esquema de base de datos (PostgreSQL)
-- ADVERTENCIA: este script BORRA todas las tablas antes de crearlas.
-- No ejecutar sobre la base de la demo (cuidarte_db) con datos reales.
-- Para probarlo, crear antes una base vacía (ej: cuidarte_schema_test).
-- =====================================================================

-- ELIMINACIÓN PREVIA
DROP TABLE IF EXISTS beneficios CASCADE;
DROP TABLE IF EXISTS medicamentos CASCADE;
DROP TABLE IF EXISTS tratamientos CASCADE;
DROP TABLE IF EXISTS citas_medicas CASCADE;
DROP TABLE IF EXISTS pacientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- CREACIÓN DE TABLAS (3FN)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(30) DEFAULT 'Cuidador Principal',
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pacientes (
    rut_paciente VARCHAR(12) PRIMARY KEY,
    nombre_paciente VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    nivel_dependencia VARCHAR(30) NOT NULL,
    direccion TEXT NOT NULL,
    id_usuario INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE citas_medicas (
    id_cita SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL,
    especialidad VARCHAR(80) NOT NULL,
    profesional VARCHAR(100) NOT NULL,
    estado_cita VARCHAR(30) DEFAULT 'Confirmada',
    rut_paciente VARCHAR(12) NOT NULL,
    CONSTRAINT fk_cita_paciente FOREIGN KEY (rut_paciente) REFERENCES pacientes(rut_paciente) ON DELETE CASCADE
);

CREATE TABLE tratamientos (
    id_esquema SERIAL PRIMARY KEY,
    descripcion_tratamiento VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    estado_tratamiento VARCHAR(30) DEFAULT 'Al día',
    rut_paciente VARCHAR(12) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_tratamiento_paciente FOREIGN KEY (rut_paciente) REFERENCES pacientes(rut_paciente) ON DELETE CASCADE
);

CREATE TABLE medicamentos (
    id_medicamento SERIAL PRIMARY KEY,
    nombre_medicamento VARCHAR(100) NOT NULL,
    concentracion VARCHAR(50) NOT NULL,
    laboratorio VARCHAR(100),
    id_esquema INT NOT NULL,
    dosis VARCHAR(50),
    frecuencia_horas INT,
    hora_primera_dosis TIME NOT NULL DEFAULT '08:00',
    CONSTRAINT fk_medicamento_esquema FOREIGN KEY (id_esquema) REFERENCES tratamientos(id_esquema) ON DELETE CASCADE
);

CREATE TABLE beneficios (
    id_beneficio SERIAL PRIMARY KEY,
    nombre_beneficio VARCHAR(120) NOT NULL,
    descripcion TEXT,
    estado_beneficio VARCHAR(30) DEFAULT 'Activo',
    rut_paciente VARCHAR(12) NOT NULL,
    CONSTRAINT fk_beneficio_paciente FOREIGN KEY (rut_paciente) REFERENCES pacientes(rut_paciente) ON DELETE CASCADE
);

-- DATOS DE PRUEBA (SEED)
-- El hash es un marcador: para iniciar sesión, registra usuarios con
-- POST /api/usuarios/registro, o reemplaza el hash por uno generado con bcrypt.
-- El rol Administrador solo se asigna por BD (nunca desde la app).
INSERT INTO usuarios (nombre, correo, password_hash, telefono, rol) VALUES
('Loredana Romano', 'l.romano@cuidarte.cl', '$2a$10$e8Z3Pq0L...', '+56912345678', 'Administrador');

INSERT INTO pacientes (rut_paciente, nombre_paciente, fecha_nacimiento, nivel_dependencia, direccion, id_usuario) VALUES
('14.567.890-2', 'Enrico Romano', '1958-06-15', 'Dependencia Severa', 'Quinta Normal, Santiago', 1);

INSERT INTO citas_medicas (fecha_hora, especialidad, profesional, estado_cita, rut_paciente) VALUES
('2026-11-10 10:30:00', 'Geriatría', 'Dr. Fuenzalida', 'Confirmada', '14.567.890-2'),
('2026-11-20 15:00:00', 'Kinesiología', 'Dra. Loyola', 'Pendiente', '14.567.890-2');

INSERT INTO tratamientos (descripcion_tratamiento, fecha_inicio, estado_tratamiento, rut_paciente) VALUES
('Manejo del dolor', '2026-11-01', 'Al día', '14.567.890-2');

INSERT INTO medicamentos (nombre_medicamento, concentracion, laboratorio, id_esquema, dosis, frecuencia_horas, hora_primera_dosis) VALUES
('Tramadol', '50 mg cápsulas', 'Laboratorio Chile', 1, '1 cápsula', 8, '06:00');

INSERT INTO beneficios (nombre_beneficio, descripcion, estado_beneficio, rut_paciente) VALUES
('Estipendio Cuidador - Chile Cuida', 'Subsidio mensual para cuidadores informales', 'Activo', '14.567.890-2');