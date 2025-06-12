const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  cv: { type: String, required: true },
  voltagem: { type: String, required: true },
  tensao: { type: String, required: true },
  tipoLigacao: { type: String, required: true },
  observacoes: { type: String },
  imagem: { type: String }, // Removido required: true para tornar opcional
  arquivos: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Motor', motorSchema);