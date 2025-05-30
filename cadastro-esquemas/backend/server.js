const express = require('mongoose');
const mongoose = require('mongoose');
const cors = require('cors');
const motorRoutes = require('./routes/motor');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🧠 Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('🟢 Conectado ao MongoDB'))
.catch((err) => console.error('🔴 Erro na conexão com MongoDB:', err));

// 🚀 Middlewares
app.use(cors());
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
