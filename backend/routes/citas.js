const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/citas', async (req, res) => {
    const { fecha_hora, especialidad, profesional, rut_paciente } = req.body;

    if (!fecha_hora || !especialidad || !profesional || !rut_paciente) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
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

module.exports = router;