// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const motorRoutes = require('./routes/motor');

// 🔐 Carrega variáveis do .env
dotenv.config();

const app = express();

// 🌐 Configura CORS para aceitar requisições do frontend
app.use(cors({
  origin: '*', // ou ['https://seusite.com'] se quiser limitar
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🧠 Conecta ao banco MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch((err) => {
  console.error('🔴 Erro ao conectar ao MongoDB:', err.message);
  process.exit(1); // encerra se falhar
});

// 🧱 Middlewares e rotas
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/motores', motorRoutes);

// 🚀 Inicializa servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
