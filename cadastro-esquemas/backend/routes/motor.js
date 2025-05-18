const express = require('express');
const multer = require('multer');
const Motor = require('../models/Motor');
const router = express.Router();

// 📁 Configuração do multer para salvar imagem na pasta /uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ✅ ROTA: CADASTRAR MOTOR
router.post('/cadastrar', upload.single('imagem'), async (req, res) => {
  try {
    const {
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes // ⚠️ Corrigido de "observacao" para "observacoes" (como no frontend)
    } = req.body;

    const novoMotor = new Motor({
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes,
      imagem: req.file ? req.file.filename : null // ⚠️ Corrigido para bater com o nome usado no listar.js
    });

    await novoMotor.save();
    res.status(201).json({ mensagem: 'Motor cadastrado com sucesso', motor: novoMotor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar motor', detalhe: erro.message });
  }
});

// ✅ ROTA: BUSCAR MOTORES COM FILTRO
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
