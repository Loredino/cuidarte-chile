const pool = require('../db');

// Deja pasar solo a usuarios activos con rol Administrador.
// Consulta la BD (no confía en el rol guardado en el token).
module.exports = async function soloAdmin(req, res, next) {
    try {
        const r = await pool.query(
            'SELECT rol FROM usuarios WHERE id_usuario = $1 AND activo = TRUE',
            [req.usuario.id_usuario]
        );
        if (!r.rows[0] || r.rows[0].rol !== 'Administrador') {
            return res.status(403).json({ error: 'Acceso restringido a administradores' });
        }
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al verificar permisos' });
    }
};