const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const motorRoutes = require('./routes/motor');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Verificação das variáveis de ambiente
if (!process.env.MONGO_URI) {
  console.error('🔴 Erro: MONGO_URI não está definido nas variáveis de ambiente.');
  process.exit(1);
}

// Log para depuração das variáveis de ambiente
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '****' : 'undefined');

// 🧠 Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 Conectado ao MongoDB'))
  .catch((err) => {
    console.error('🔴 Erro na conexão com MongoDB:', err);
    process.exit(1); // Encerra o processo se a conexão falhar
  });

// 🚀 Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://bsmotores-esquemas.onrender.com',
    'https://cadastro-esquema-bsmotores-kb0e.vercel.app'
  ],
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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('🔴 Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno no servidor', detalhe: err.message });
});

// ▶️ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});