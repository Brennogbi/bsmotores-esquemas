



// routes/motor.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Motor = require('../models/Motor');
const router = express.Router();

// Configuração Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'motores',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

const upload = multer({ storage });

// Rota: Cadastrar motor
router.post('/cadastrar', upload.single('imagem'), async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes } = req.body;

    if (!req.file) {
      return res.status(400).json({ erro: 'Imagem é obrigatória.' });
    }

    const novoMotor = new Motor({
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes,
      imagem: req.file.path
    });

    await novoMotor.save();
    res.status(201).json({ mensagem: 'Motor cadastrado com sucesso', motor: novoMotor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar motor', detalhe: erro.message });
  }
});

// Rota: Buscar motores com filtros opcionais
router.get('/buscar', async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao } = req.query;

    const filtro = {};
    if (marca) filtro.marca = new RegExp(marca, 'i'); // busca parcial
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


// Rota: Deletar motor por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const motor = await Motor.findByIdAndDelete(id);

    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    res.json({ mensagem: 'Motor deletado com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar motor.', detalhe: erro.message });
  }
});


module.exports = router;
