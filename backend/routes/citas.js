const express = require('express');
const router = express.Router();
const pool = require('../db');

// Agenda una cita; verifica que el paciente pertenezca al usuario autenticado
router.post('/citas', async (req, res) => {
    const { fecha_hora, especialidad, profesional, rut_paciente } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!fecha_hora || !especialidad || !profesional || !rut_paciente) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // El paciente debe pertenecer al usuario del token
        const dueno = await pool.query(
            `SELECT 1 FROM pacientes
             WHERE rut_paciente = $1 AND id_usuario = $2`,
            [rut_paciente, id_usuario]
        );
        if (dueno.rowCount === 0) {
            return res.status(404).json({ error: 'El paciente no existe' });
        }

        const r = await pool.query(
            `INSERT INTO citas_medicas (fecha_hora, especialidad, profesional, rut_paciente)
             VALUES ($1, $2, $3, $4)
             RETURNING id_cita`,
            [fecha_hora, especialidad, profesional, rut_paciente]
        );
        res.status(201).json({ mensaje: 'Cita agendada', id_cita: r.rows[0].id_cita });
    } catch (error) {
        if (error.code === '23503') return res.status(404).json({ error: 'El paciente no existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al agendar la cita' });
    }
});

// Citas de los pacientes del usuario autenticado: GET /api/citas
router.get('/citas', async (req, res) => {
    const id_usuario = req.usuario.id_usuario;

    try {
        const r = await pool.query(
            `SELECT c.id_cita, c.fecha_hora, c.especialidad, c.profesional,
                    c.estado_cita, p.nombre_paciente
             FROM citas_medicas c
             JOIN pacientes p ON p.rut_paciente = c.rut_paciente
             WHERE p.id_usuario = $1
             ORDER BY c.fecha_hora`,
            [id_usuario]
        );
        res.json(r.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar citas' });
    }
});

module.exports = router;