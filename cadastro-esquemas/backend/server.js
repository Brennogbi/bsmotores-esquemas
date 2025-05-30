// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const motorRoutes = require('./routes/motor');

dotenv.config();

const app = express();

// Conexão MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch(err => console.error('🔴 Erro ao conectar:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/motores', motorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
