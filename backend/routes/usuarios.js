const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// REGISTRO: guarda la contraseña como hash, nunca en texto plano
router.post('/usuarios/registro', async (req, res) => {
    const { nombre, correo, password, telefono } = req.body;

    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'nombre, correo y password son obligatorios' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const r = await pool.query(
            `INSERT INTO usuarios (nombre, correo, password_hash, telefono)
             VALUES ($1, $2, $3, $4)
             RETURNING id_usuario, nombre, correo, rol`,
            [nombre, correo, hash, telefono || null]
        );
        res.status(201).json({ mensaje: 'Usuario registrado', usuario: r.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ese correo ya está registrado' });
        }
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// LOGIN: compara la clave ingresada contra el hash guardado
router.post('/usuarios/login', async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ error: 'correo y password son obligatorios' });
    }

    try {
        const r = await pool.query(
            `SELECT id_usuario, nombre, correo, rol, password_hash
             FROM usuarios
             WHERE correo = $1 AND activo = TRUE`,
            [correo]
        );

        const usuario = r.rows[0];
        // Mismo mensaje si el correo no existe o la clave falla
        const ok = usuario && await bcrypt.compare(password, usuario.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        delete usuario.password_hash;
        res.json({ mensaje: 'Inicio de sesión correcto', usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;