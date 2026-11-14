const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Importar y usar las rutas de tratamientos
const tratamientosRoutes = require('./routes/tratamientos');
app.use('/api', tratamientosRoutes);
app.use('/api', require('./routes/pacientes'));
app.use('/api', require('./routes/citas'));
// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.send('API de CuidARTE Chile funcionando correctamente 🚀');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});