const express = require('express');
const router = express.Router();
const verifyToken = require('../verifyToken');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuramos multer para almacenamiento temporal
const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
});

// GET /secure/credito
router.get('/credito', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT id, monto, cuotas, estado FROM solicitudes WHERE usuario_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener crédito:', err);
    res.status(500).json({ success: false, message: 'Error al obtener crédito' });
  }
});

// POST /secure/upload
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    // Aquí req.file es el archivo subido
    // Por ejemplo, guardamos el archivo localmente y retornamos su ruta
    const { originalname, filename, path: tempPath } = req.file;

    // Si quisieras mandarlo a Google Drive, aquí invocarías tu lógica con el SDK
    // y luego limpiarías el archivo temporal:
    // await uploadToDrive(tempPath, originalname);
    // fs.unlinkSync(tempPath);

    res.json({
      success: true,
      filename,
      originalname
    });
  } catch (err) {
    console.error('Error al subir archivo:', err);
    res.status(500).json({ success: false, message: 'Error al subir archivo' });
  }
});

module.exports = router;
