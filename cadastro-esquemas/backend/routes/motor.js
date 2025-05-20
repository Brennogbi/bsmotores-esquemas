const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // ✅ IMPORTAÇÃO ADICIONADA
const cloudinary = require('cloudinary').v2; // ✅ IMPORTAÇÃO ADICIONADA
const Motor = require('../models/Motor');
const router = express.Router();

// ✅ CONFIGURAÇÃO DO CLOUDINARY (usa variáveis .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ ARMAZENAMENTO NO CLOUDINARY EM VEZ DE LOCAL
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'motores', // Pasta no Cloudinary onde as imagens ficarão
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage }); // substitui multer.diskStorage

// ✅ ROTA: CADASTRAR MOTOR COM IMAGEM NO CLOUDINARY
router.post('/cadastrar', upload.single('imagem'), async (req, res) => {
  try {
    const {
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes
    } = req.body;

    const novoMotor = new Motor({
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes,
      imagem: req.file ? req.file.path : null // ✅ SALVA A URL DA IMAGEM NO CLOUDINARY
    });

    await novoMotor.save();
    res.status(201).json({ mensagem: 'Motor cadastrado com sucesso', motor: novoMotor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar motor', detalhe: erro.message });
  }
});

// ✅ ROTA: BUSCAR MOTORES COM FILTROS OPCIONAIS
router.get('/buscar', async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao } = req.query;

    const filtro = {};
    if (marca) filtro.marca = marca;
    if (cv) filtro.cv = cv;
    if (voltagem) filtro.voltagem = voltagem;
    if (tensao) filtro.tensao = tensao;
    if (tipoLigacao) filtro.tipoLigacao = tipoLigacao;

    const motores = await Motor.find(filtro);
    res.json(motores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar motores', detalhe: erro.message });
  }
});

module.exports = router;
