const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/pacientes', async (req, res) => {
    const { rut_paciente, nombre_paciente, fecha_nacimiento,
            nivel_dependencia, direccion, id_usuario } = req.body;

    if (!rut_paciente || !nombre_paciente || !fecha_nacimiento ||
        !nivel_dependencia || !direccion || !id_usuario) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        const r = await pool.query(
            `INSERT INTO pacientes
               (rut_paciente, nombre_paciente, fecha_nacimiento, nivel_dependencia, direccion, id_usuario)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING rut_paciente, nombre_paciente`,
            [rut_paciente, nombre_paciente, fecha_nacimiento, nivel_dependencia, direccion, id_usuario]
        );
        res.status(201).json({ mensaje: 'Paciente registrado', paciente: r.rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: 'Ya existe un paciente con ese RUT' });
        if (error.code === '23503') return res.status(404).json({ error: 'El usuario cuidador no existe' });
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el paciente' });
    }
});

module.exports = router;