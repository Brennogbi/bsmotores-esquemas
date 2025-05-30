const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  cv: { type: Number, required: true },
  voltagem: { type: Number, required: true },
  tensao: { type: Number, required: true },
  tipoLigacao: { type: String, required: true },
  observacoes: { type: String },
  imagem: { type: String, required: true }, // URL da imagem no Cloudinary
  arquivos: [{ type: String }], // Array de URLs dos arquivos (PDF, imagens, etc.)
}, { timestamps: true });

module.exports = mongoose.model('Motor', motorSchema);