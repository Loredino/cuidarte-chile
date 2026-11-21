const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

const auth = require('./middleware/auth');

// Rutas públicas (registro y login)
app.use('/api', require('./routes/usuarios'));

// Rutas protegidas (exigen token JWT)
app.use('/api', auth);
app.use('/api', require('./routes/tratamientos'));
app.use('/api', require('./routes/pacientes'));
app.use('/api', require('./routes/citas'));
app.use('/api', require('./routes/beneficios'));
app.use('/api/admin', require('./routes/admin'));

// Frontend compilado (React). Solo existe después de ejecutar "npm run build" en frontend.
const dist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(dist));

// Ruta de prueba de la API
app.get('/api/salud', (req, res) => {
    res.send('API de CuidARTE Chile funcionando correctamente 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});