const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'clave_secreta_temporal'; // pon esto en .env
const verifyToken = require('../verifyToken');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password, recaptchaToken } = req.body;

  // ... validación de reCAPTCHA omitida por simplicidad

  try {
    const result = await pool.query('SELECT * FROM login WHERE usuario = $1', [username]);
    const user = result.rows[0];

    if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.contraseña);
    if (!match) return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });

    // 🔐 Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        usuario: user.usuario,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '2h' }
    );

    return res.json({
      success: true,
      token,
      isFirstLogin: user.isfirstlogin,
      userId: user.id,
      role: user.role,
    });

  } catch (err) {
    console.error('Error en /auth/login:', err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

router.post('/primer-ingreso', async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE login SET contraseña = $1, isfirstlogin = false WHERE id = $2',
      [hashed, userId]
    );

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

router.get('/perfil', verifyToken, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

module.exports = router;
