const express = require('express');
const router = express.Router();
const pool = require('../db');
const soloAdmin = require('../middleware/admin');

router.use(soloAdmin);

// Lista todos los usuarios (nunca devuelve password_hash)
router.get('/usuarios', async (req, res) => {
    try {
        const r = await pool.query(
            `SELECT u.id_usuario, u.nombre, u.correo, u.telefono, u.rol, u.activo,
                    (SELECT COUNT(*) FROM pacientes p WHERE p.id_usuario = u.id_usuario)::int AS total_pacientes
             FROM usuarios u
             ORDER BY u.id_usuario`
        );
        res.json(r.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
});

// Activa o desactiva una cuenta: body { "activo": true | false }
router.patch('/usuarios/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { activo } = req.body;

    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'id inválido' });
    }
    if (typeof activo !== 'boolean') {
        return res.status(400).json({ error: 'activo debe ser true o false' });
    }
    if (id === req.usuario.id_usuario) {
        return res.status(400).json({ error: 'No puedes cambiar el estado de tu propia cuenta' });
    }

    try {
        const r = await pool.query(
            `UPDATE usuarios SET activo = $1 WHERE id_usuario = $2
             RETURNING id_usuario, nombre, correo, rol, activo`,
            [activo, id]
        );
        if (r.rowCount === 0) {
            return res.status(404).json({ error: 'El usuario no existe' });
        }
        res.json({ mensaje: 'Usuario actualizado', usuario: r.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
});

module.exports = router;