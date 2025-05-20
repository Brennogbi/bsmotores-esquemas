// models/Motor.js
const mongoose = require('mongoose');

const MotorSchema = new mongoose.Schema({
  marca: { type: String, required: true },
  cv: { type: Number, required: true },
  voltagem: { type: String, required: true },
  tensao: { type: String, required: true },
  tipoLigacao: { type: String, enum: ['monofasico', 'trifasico'], required: true },
  observacoes: { type: String },
  imagem: { type: String }
});

module.exports = mongoose.model('Motor', MotorSchema);
