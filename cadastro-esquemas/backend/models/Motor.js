const mongoose = require('mongoose');

const MotorSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  cv: { type: Number, required: true },
  voltagem: { type: String, required: true },
  tensao: { type: String, required: true },
  tipoLigacao: { type: String, enum: ['monofasico', 'trifasico'], required: true },
  observacoes: { type: String },
  imagem: { type: String },
  arquivos: [{ type: String }], // 🔥 Novidade: múltiplos arquivos como PDF, esquemas, etc.
}, { timestamps: true }); // 🔥 Adiciona createdAt e updatedAt automaticamente

module.exports = mongoose.model('Motor', MotorSchema);
