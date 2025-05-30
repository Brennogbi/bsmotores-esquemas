const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const motorRoutes = require('./routes/motor');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧠 Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Conectado ao MongoDB'))
  .catch((err) => console.error('🔴 Erro na conexão com MongoDB:', err));

// 🚀 Middlewares
app.use(cors({
  origin: ['http://localhost:3000', 'https://bsmotores-esquemas.onrender.com'], // Permitir frontend local e hospedado
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🔗 Rotas
app.use('/api/motores', motorRoutes);

// 🌎 Rota inicial só para teste
app.get('/', (req, res) => {
  res.send('API de cadastro de motores funcionando! 🔥');
});

// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});