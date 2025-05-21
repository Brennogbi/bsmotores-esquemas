// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const motorRoutes = require('./routes/motor');

dotenv.config(); // ✅ Carrega variáveis do .env

const app = express();

// 🛠️ Configuração de CORS para aceitar requisições de qualquer origem
app.use(cors({
  origin: '*', // ou defina o domínio do frontend: ['https://seusite.com']
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🧠 Conecta ao MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch(err => console.error('🔴 Erro ao conectar:', err));

// 🧱 Middlewares
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/motores', motorRoutes);

// 🚀 Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
