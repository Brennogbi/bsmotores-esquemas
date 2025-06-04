const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Motor = require('../models/Motor');
const router = express.Router();

// 🔧 Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'motores',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB por arquivo
});

// 📤 POST - Cadastrar motor
router.post('/cadastrar', upload.fields([
  { name: 'imagem', maxCount: 1 }, // Imagem principal
  { name: 'arquivos', maxCount: 10 } // Até 10 arquivos adicionais (fotos ou PDFs)
]), async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes } = req.body;

    // Verifica se a imagem principal foi enviada
    if (!req.files['imagem'] || !req.files['imagem'][0]) {
      return res.status(400).json({ erro: 'Imagem principal é obrigatória.' });
    }

    // URLs dos arquivos enviados
    const imagemPrincipal = req.files['imagem'][0].path; // URL da imagem principal
    const arquivosAdicionais = req.files['arquivos']
      ? req.files['arquivos'].map(file => file.path) // URLs dos arquivos adicionais
      : [];

    const novoMotor = new Motor({
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes,
      imagem: imagemPrincipal,
      arquivos: arquivosAdicionais
    });

    await novoMotor.save();
    res.status(201).json({ mensagem: 'Motor cadastrado com sucesso', motor: novoMotor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar motor', detalhe: erro.message });
  }
});

// 🔍 GET - Buscar motores com filtros
router.get('/buscar', async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao, _id } = req.query;

    const filtro = {};
    if (marca) filtro.marca = new RegExp(marca, 'i');
    if (cv) filtro.cv = cv;
    if (voltagem) filtro.voltagem = voltagem;
    if (tensao) filtro.tensao = tensao;
    if (tipoLigacao) filtro.tipoLigacao = tipoLigacao;
    if (_id) filtro._id = _id;

    const motores = await Motor.find(filtro);
    res.json(motores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar motores', detalhe: erro.message });
  }
});

// 📊 GET - Contar total de motores
router.get('/contar', async (req, res) => {
  try {
    const total = await Motor.countDocuments();
    res.json({ total });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao contar motores', detalhe: erro.message });
  }
});

// ✏️ PUT - Editar motor por ID
router.put('/:id', upload.fields([
  { name: 'imagem', maxCount: 1 }, // Imagem principal (opcional)
  { name: 'arquivos', maxCount: 10 } // Arquivos adicionais (opcional)
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes, arquivosParaManter } = req.body;

    // Buscar motor existente
    const motor = await Motor.findById(id);
    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    // Atualizar campos de texto
    motor.marca = marca || motor.marca;
    motor.cv = cv || motor.cv;
    motor.voltagem = voltagem || motor.voltagem;
    motor.tensao = tensao || motor.tensao;
    motor.tipoLigacao = tipoLigacao || motor.tipoLigacao;
    motor.observacoes = observacoes || motor.observacoes;

    // Atualizar imagem principal, se fornecida
    if (req.files['imagem'] && req.files['imagem'][0]) {
      // Remover imagem antiga do Cloudinary
      if (motor.imagem) {
        const publicId = motor.imagem.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`motores/${publicId}`);
      }
      motor.imagem = req.files['imagem'][0].path;
    }

    // Atualizar arquivos adicionais
    if (req.files['arquivos'] || arquivosParaManter) {
      // Lista de arquivos a manter (enviada pelo frontend)
      const arquivosMantidos = arquivosParaManter ? JSON.parse(arquivosParaManter) : [];

      // Remover arquivos que não estão na lista de mantidos
      if (motor.arquivos && motor.arquivos.length > 0) {
        for (const arquivo of motor.arquivos) {
          if (!arquivosMantidos.includes(arquivo)) {
            const publicId = arquivo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`motores/${publicId}`);
          }
        }
      }

      // Filtrar arquivos mantidos e adicionar novos
      motor.arquivos = arquivosMantidos.filter(arquivo => motor.arquivos.includes(arquivo));
      if (req.files['arquivos']) {
        const novosArquivos = req.files['arquivos'].map(file => file.path);
        motor.arquivos = [...motor.arquivos, ...novosArquivos];
      }
    }

    await motor.save();
    res.json({ mensagem: 'Motor atualizado com sucesso', motor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar motor', detalhe: erro.message });
  }
});

// ❌ DELETE - Remover motor por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const motor = await Motor.findByIdAndDelete(id);

    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    // Remover arquivos do Cloudinary
    if (motor.imagem) {
      const publicId = motor.imagem.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`motores/${publicId}`);
    }
    if (motor.arquivos && motor.arquivos.length > 0) {
      for (const arquivo of motor.arquivos) {
        const publicId = arquivo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`motores/${publicId}`);
      }
    }

    res.json({ mensagem: 'Motor deletado com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar motor.', detalhe: erro.message });
  }
});

module.exports = router;