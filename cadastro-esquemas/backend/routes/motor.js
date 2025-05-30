const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Motor = require('../models/Motor');
const router = express.Router();
require('dotenv').config();

// Verificação das credenciais do Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('🔴 Erro: Credenciais do Cloudinary não estão definidas nas variáveis de ambiente.');
  process.exit(1);
}

// 🔧 Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log('🟢 Cloudinary configurado com sucesso');

// 📦 Storage para imagens
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'motores/imagens',
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
});

// 📑 Storage para outros arquivos (PDFs, esquemas, etc.)
const fileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'motores/arquivos',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png']
  }
});

const uploadImage = multer({ storage: imageStorage });
const uploadFiles = multer({ storage: fileStorage });

// 🔥 POST - Cadastrar motor
router.post('/cadastrar', uploadImage.single('imagem'), uploadFiles.array('arquivos', 5), async (req, res) => {
  try {
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes } = req.body;

    // Validação explícita dos campos obrigatórios
    if (!marca || !cv || !voltagem || !tensao || !tipoLigacao) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios (marca, cv, voltagem, tensao, tipoLigacao) devem ser preenchidos.' });
    }
    if (!req.file) {
      return res.status(400).json({ erro: 'Imagem é obrigatória.' });
    }

    const arquivos = req.files ? req.files.map(file => file.path) : [];

    const novoMotor = new Motor({
      marca,
      cv: Number(cv),
      voltagem: Number(voltagem),
      tensao: Number(tensao),
      tipoLigacao,
      observacoes,
      imagem: req.file.path,
      arquivos
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
    const { marca, cv, voltagem, tensao, tipoLigacao } = req.query;

    const filtro = {};
    if (marca) filtro.marca = new RegExp(marca, 'i');
    if (cv) filtro.cv = Number(cv);
    if (voltagem) filtro.voltagem = Number(voltagem);
    if (tensao) filtro.tensao = Number(tensao);
    if (tipoLigacao) filtro.tipoLigacao = tipoLigacao;

    const motores = await Motor.find(filtro).sort({ createdAt: -1 });
    res.json(motores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar motores', detalhe: erro.message });
  }
});

// 📈 GET - Quantidade total de motores
router.get('/quantidade', async (req, res) => {
  try {
    const total = await Motor.countDocuments();
    res.json({ total });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao contar motores', detalhe: erro.message });
  }
});

// 🕑 GET - Últimos motores adicionados (limite de 5)
router.get('/ultimos', async (req, res) => {
  try {
    const motores = await Motor.find().sort({ createdAt: -1 }).limit(5);
    res.json(motores);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar últimos motores', detalhe: erro.message });
  }
});

// ✏️ PUT - Editar motor por ID
router.put('/editar/:id', uploadImage.single('imagem'), uploadFiles.array('arquivos', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, cv, voltagem, tensao, tipoLigacao, observacoes } = req.body;

    // Validação explícita dos campos obrigatórios
    if (!marca || !cv || !voltagem || !tensao || !tipoLigacao) {
      return res.status(400).json({ erro: 'Todos os campos obrigatórios (marca, cv, voltagem, tensao, tipoLigacao) devem ser preenchidos.' });
    }

    const dadosAtualizados = {
      marca,
      cv: Number(cv),
      voltagem: Number(voltagem),
      tensao: Number(tensao),
      tipoLigacao,
      observacoes,
    };

    if (req.file) {
      dadosAtualizados.imagem = req.file.path;
    }

    if (req.files && req.files.length > 0) {
      dadosAtualizados.arquivos = req.files.map(file => file.path);
    }

    const motor = await Motor.findByIdAndUpdate(id, dadosAtualizados, { new: true });

    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    res.json({ mensagem: 'Motor atualizado com sucesso', motor });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar motor', detalhe: erro.message });
  }
});

// ❌ DELETE - Remover motor por ID (incluindo Cloudinary)
router.delete('/:id', async (req, res) => {
  // NOTA: Considere adicionar autenticação (ex.: JWT) aqui para maior segurança
  try {
    const { id } = req.params;
    const motor = await Motor.findById(id);

    if (!motor) {
      return res.status(404).json({ erro: 'Motor não encontrado.' });
    }

    // 🔥 Função auxiliar para extrair o public_id
    const getPublicId = (url) => {
      const parts = url.split('/');
      const fileName = parts[parts.length - 1];
      const publicId = fileName.substring(0, fileName.lastIndexOf('.'));
      const folder = parts.slice(parts.indexOf('motores')).join('/').replace(`/${fileName}`, '');
      return `${folder}/${publicId}`;
    };

    // 🗑️ Deletar imagem principal
    if (motor.imagem) {
      const publicIdImagem = getPublicId(motor.imagem);
      await cloudinary.uploader.destroy(publicIdImagem, { resource_type: 'image' });
    }

    // 🗑️ Deletar arquivos extras
    if (motor.arquivos && motor.arquivos.length > 0) {
      for (const arquivoUrl of motor.arquivos) {
        const publicIdArquivo = getPublicId(arquivoUrl);
        const resourceType = arquivoUrl.endsWith('.pdf') ? 'raw' : 'image';
        await cloudinary.uploader.destroy(publicIdArquivo, { resource_type: resourceType });
      }
    }

    // 🔥 Deletar do MongoDB
    await Motor.findByIdAndDelete(id);

    res.json({ mensagem: 'Motor deletado com sucesso, incluindo arquivos do Cloudinary.' });

  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar motor', detalhe: erro.message });
  }
});

module.exports = router;