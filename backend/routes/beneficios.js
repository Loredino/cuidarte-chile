const express = require('express');
const router = express.Router();
const pool = require('../db');

// Registra un beneficio para un paciente del usuario autenticado: POST /api/beneficios
router.post('/beneficios', async (req, res) => {
    const { nombre_beneficio, descripcion, estado_beneficio, rut_paciente } = req.body;
    const id_usuario = req.usuario.id_usuario;

    if (!nombre_beneficio || !rut_paciente) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (String(nombre_beneficio).length > 120) {
        return res.status(400).json({ error: 'nombre_beneficio supera los 120 caracteres' });
    }

    try {
        // El paciente debe pertenecer al usuario del token
        const dueno = await pool.query(
            'SELECT 1 FROM pacientes WHERE rut_paciente = $1 AND id_usuario = $2',
            [rut_paciente, id_usuario]
        );
        if (dueno.rowCount === 0) {
            return res.status(404).json({ error: 'El paciente no existe' });
        }

        const r = await pool.query(
            `INSERT INTO beneficios (nombre_beneficio, descripcion, estado_beneficio, rut_paciente)
             VALUES ($1, $2, $3, $4)
             RETURNING id_beneficio`,
            [nombre_beneficio, descripcion || null, estado_beneficio || 'Activo', rut_paciente]
        );
        res.status(201).json({ mensaje: 'Beneficio registrado', id_beneficio: r.rows[0].id_beneficio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el beneficio' });
    }
});

// Beneficios de los pacientes del usuario autenticado: GET /api/beneficios
router.get('/beneficios', async (req, res) => {
    const id_usuario = req.usuario.id_usuario;

    try {
        const r = await pool.query(
            `SELECT b.id_beneficio, b.nombre_beneficio, b.descripcion,
                    b.estado_beneficio, p.nombre_paciente
             FROM beneficios b
             JOIN pacientes p ON p.rut_paciente = b.rut_paciente
             WHERE p.id_usuario = $1
             ORDER BY b.id_beneficio DESC`,
            [id_usuario]
        );
        res.json(r.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar beneficios' });
    }
});

module.exports = router;