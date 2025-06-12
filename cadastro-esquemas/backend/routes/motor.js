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

// Configuração de armazenamento para imagem principal (pasta 'motores')
const storageImagem = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'motores',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// Configuração de armazenamento para arquivos adicionais (pasta temporária 'motores')
const storageArquivos = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'motores',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf']
  }
});

const upload = multer({
  storage: storageImagem,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

const uploadArquivos = multer({
  storage: storageArquivos,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// 📤 POST - Cadastrar motor
router.post('/cadastrar', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'arquivos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes } = req.body;

    // Imagem principal é opcional
    const imagemPrincipal = req.files['imagem'] && req.files['imagem'][0]
      ? req.files['imagem'][0].path
      : null;

    // Criar motor sem arquivos adicionais primeiro
    const novoMotor = new Motor({
      marca,
      cv,
      voltagem,
      tensao,
      tipoLigacao,
      observacoes,
      imagem: imagemPrincipal,
      arquivos: []
    });

    await novoMotor.save();

    // Mover arquivos adicionais para subpasta 'motores/<motorId>/adicionais'
    let arquivosAdicionais = [];
    if (req.files['arquivos']) {
      const subpasta = `motores/${novoMotor._id}/adicionais`;
      for (const arquivo of req.files['arquivos']) {
        const publicIdOriginal = arquivo.path.split('/').pop().split('.')[0];
        const novoCaminho = await cloudinary.uploader.upload(arquivo.path, {
          folder: subpasta,
          public_id: publicIdOriginal
        });
        arquivosAdicionais.push(novoCaminho.secure_url);
        // Remover arquivo temporário da pasta 'motores'
        await cloudinary.uploader.destroy(`motores/${publicIdOriginal}`);
      }
      novoMotor.arquivos = arquivosAdicionais;
      await novoMotor.save();
    }

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
  { name: 'imagem', maxCount: 1 },
  { name: 'arquivos', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes, arquivosParaManter } = req.body;

    const motor = await Motor.findById(id);
    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    motor.marca = marca || motor.marca;
    motor.cv = cv || motor.cv;
    motor.voltagem = voltagem || motor.voltagem;
    motor.tensao = tensao || motor.tensao;
    motor.tipoLigacao = tipoLigacao || motor.tipoLigacao;
    motor.observacoes = observacoes || motor.observacoes;

    // Atualizar imagem principal, se fornecida
    if (req.files['imagem'] && req.files['imagem'][0]) {
      if (motor.imagem) {
        const publicId = motor.imagem.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`motores/${publicId}`);
      }
      motor.imagem = req.files['imagem'][0].path;
    }

    // Atualizar arquivos adicionais
    if (req.files['arquivos'] || arquivosParaManter) {
      const arquivosMantidos = arquivosParaManter ? JSON.parse(arquivosParaManter) : [];

      // Remover arquivos não mantidos
      if (motor.arquivos && motor.arquivos.length > 0) {
        for (const arquivo of motor.arquivos) {
          if (!arquivosMantidos.includes(arquivo)) {
            const publicId = arquivo.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`motores/${motor._id}/adicionais/${publicId}`);
          }
        }
      }

      motor.arquivos = arquivosMantidos.filter(arquivo => motor.arquivos.includes(arquivo));

      // Adicionar novos arquivos à subpasta
      if (req.files['arquivos']) {
        const subpasta = `motores/${motor._id}/adicionais`;
        const novosArquivos = [];
        for (const arquivo of req.files['arquivos']) {
          const publicIdOriginal = arquivo.path.split('/').pop().split('.')[0];
          const novoCaminho = await cloudinary.uploader.upload(arquivo.path, {
            folder: subpasta,
            public_id: publicIdOriginal
          });
          novosArquivos.push(novoCaminho.secure_url);
          await cloudinary.uploader.destroy(`motores/${publicIdOriginal}`);
        }
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

    // Remover imagem principal, se existir
    if (motor.imagem) {
      const publicId = motor.imagem.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`motores/${publicId}`);
    }

    // Remover arquivos adicionais da subpasta
    if (motor.arquivos && motor.arquivos.length > 0) {
      for (const arquivo of motor.arquivos) {
        const publicId = arquivo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`motores/${id}/adicionais/${publicId}`);
      }
    }

    res.json({ mensagem: 'Motor deletado com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar motor.', detalhe: erro.message });
  }
});

module.exports = router;