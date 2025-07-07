const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de autenticación
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Rutas seguras para dashboard usuario
const secureRoutes = require('./routes/secureRoutes');
app.use('/secure', secureRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PORT}`);
});
