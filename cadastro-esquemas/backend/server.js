// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const motorRoutes = require('./routes/motor');

const app = express();

// Conexão com MongoDB (ajuste sua string se for diferente)
mongoose.connect('mongodb+srv://breno:zoraboqueteira@users.pwjdncf.mongodb.net/cadastro-motores?retryWrites=true&w=majority&appName=users', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch(err => console.error('🔴 Erro ao conectar:', err));

// Middlewares
app.use(cors());
app.use(express.json()); // para receber JSON
app.use('/uploads', express.static('uploads')); // serve imagens
app.use('/api/motores', motorRoutes); // rotas de motor

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
