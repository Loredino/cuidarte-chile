const express = require('express');
const router = express.Router();
const pool = require('../db');

// Valida el body y devuelve una lista de errores (vacía si todo está bien)
function validarTratamiento(body) {
    const errores = [];
    const {
        descripcion_tratamiento,
        fecha_inicio,
        fecha_fin,
        rut_paciente,
        medicamentos
    } = body || {};

    if (!descripcion_tratamiento) errores.push('descripcion_tratamiento es obligatorio');
    if (!fecha_inicio) errores.push('fecha_inicio es obligatorio');
    if (!rut_paciente) errores.push('rut_paciente es obligatorio');

    if (fecha_inicio && fecha_fin && new Date(fecha_fin) < new Date(fecha_inicio)) {
        errores.push('fecha_fin no puede ser anterior a fecha_inicio');
    }

    if (medicamentos !== undefined) {
        if (!Array.isArray(medicamentos)) {
            errores.push('medicamentos debe ser una lista');
        } else {
            medicamentos.forEach((med, i) => {
                const n = i + 1;
                if (!med.nombre_medicamento) errores.push(`medicamento ${n}: nombre_medicamento es obligatorio`);
                if (!med.concentracion) errores.push(`medicamento ${n}: concentracion es obligatoria`);
                if (!med.dosis) errores.push(`medicamento ${n}: dosis es obligatoria`);
                if (!Number.isInteger(med.frecuencia_horas) || med.frecuencia_horas <= 0) {
                    errores.push(`medicamento ${n}: frecuencia_horas debe ser un número entero mayor a 0`);
                }
            });
        }
    }

    return errores;
}

// Endpoint con control transaccional (BEGIN, COMMIT, ROLLBACK)
router.post('/tratamientos-completos', async (req, res) => {
    // 1. Validar ANTES de abrir conexión a la base de datos
    const errores = validarTratamiento(req.body);
    if (errores.length > 0) {
        return res.status(400).json({
            error: 'Datos inválidos',
            detalles: errores
        });
    }

    const {
        descripcion_tratamiento,
        fecha_inicio,
        fecha_fin,
        rut_paciente,
        medicamentos
    } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Insertar el tratamiento
        const insertTratamiento = `
            INSERT INTO tratamientos
                (descripcion_tratamiento, fecha_inicio, fecha_fin, rut_paciente)
            VALUES ($1, $2, $3, $4)
            RETURNING id_esquema;
        `;

        const resTratamiento = await client.query(insertTratamiento, [
            descripcion_tratamiento,
            fecha_inicio,
            fecha_fin || null,
            rut_paciente
        ]);

        const idEsquema = resTratamiento.rows[0].id_esquema;

        // 3. Insertar los medicamentos asociados (si existen)
        if (medicamentos && medicamentos.length > 0) {
            const insertMedicamento = `
                INSERT INTO medicamentos
                    (nombre_medicamento, concentracion, dosis, frecuencia_horas, id_esquema)
                VALUES ($1, $2, $3, $4, $5);
            `;

            for (const med of medicamentos) {
                await client.query(insertMedicamento, [
                    med.nombre_medicamento,
                    med.concentracion,
                    med.dosis,
                    med.frecuencia_horas,
                    idEsquema
                ]);
            }
        }

        // 4. Todo salió bien: confirmar cambios
        await client.query('COMMIT');

        res.status(201).json({
            mensaje: 'Tratamiento registrado correctamente',
            id_esquema: idEsquema
        });
    } catch (error) {
        // Algo falló: deshacer todo
        await client.query('ROLLBACK');
        console.error('Error al registrar tratamiento:', error);

        // 23503 = violación de llave foránea (el paciente no existe)
        if (error.code === '23503') {
            return res.status(404).json({
                error: 'El paciente indicado no existe',
                detalle: `No hay un paciente con rut_paciente ${rut_paciente}`
            });
        }

        res.status(500).json({
            error: 'Error al registrar el tratamiento',
            detalle: error.message
        });
    } finally {
        client.release();
    }
});
// Tratamientos con sus medicamentos: /api/tratamientos?id_usuario=2
router.get('/tratamientos', async (req, res) => {
    const { id_usuario } = req.query;
    if (!id_usuario) {
        return res.status(400).json({ error: 'id_usuario es obligatorio' });
    }
    try {
        const r = await pool.query(
            `SELECT t.id_esquema, t.descripcion_tratamiento, t.fecha_inicio,
                    t.fecha_fin, t.estado_tratamiento, p.nombre_paciente,
                    COALESCE(
                      json_agg(json_build_object(
                        'nombre_medicamento', m.nombre_medicamento,
                        'concentracion', m.concentracion,
                        'dosis', m.dosis,
                        'frecuencia_horas', m.frecuencia_horas
                      )) FILTER (WHERE m.id_medicamento IS NOT NULL), '[]'
                    ) AS medicamentos
             FROM tratamientos t
             JOIN pacientes p ON p.rut_paciente = t.rut_paciente
             LEFT JOIN medicamentos m ON m.id_esquema = t.id_esquema
             WHERE p.id_usuario = $1
             GROUP BY t.id_esquema, p.nombre_paciente
             ORDER BY t.id_esquema DESC`,
            [id_usuario]
        );
        res.json(r.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar tratamientos' });
    }
});
module.exports = router;