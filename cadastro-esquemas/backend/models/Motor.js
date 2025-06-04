const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  cv: { type: String, required: true }, // Corrigido: 'Text' não é um tipo válido, usei String
  voltagem: { type: String, required: true },
  tensao: { type: String, required: true },
  tipoLigacao: { type: String, required: true },
  observacoes: { type: String },
  imagem: { type: String, required: true }, // URL da imagem no Cloudinary
  arquivos: [{ type: String }], // Array de URLs dos arquivos (PDF, imagens, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Motor', motorSchema);