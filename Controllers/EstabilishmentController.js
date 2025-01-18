const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Estabilishment = require('../models/Estabilishment');
const Product = require('../models/Product');
const axios = require('axios');
const Sequelize = require('sequelize');
const QRCode = require('qrcode');
const QrCode = require("../models/QrCode");
const CheckIn = require('../models/Check_in');


const validateCNPJ = async (cnpj) => {
  try {
    const response = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
    if (response.data.status === 'ERROR') {
      throw new Error('CNPJ inválido ou não encontrado.');
    }
    return response.data;
  } catch (error) {
    throw new Error('Erro ao consultar o CNPJ: ' + error.message);
  }
};

const registerEstabilishment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, fullName, email, password, phoneNumber, address, cnpj } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const existingEstabilishment = await Estabilishment.findOne({ where: { cnpj } });
    if (existingEstabilishment) {
      return res.status(400).json({ error: "CNPJ já cadastrado." });
    }

    const cnpjInfo = await validateCNPJ(cnpj);
    if (!cnpjInfo || cnpjInfo.status === 'ERROR') {
      return res.status(400).json({ error: "CNPJ inválido." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      user_role: 'ADMIN',
    });

    const estabilishment = await Estabilishment.create({
      name,
      address,
      cnpj,
      user_id: user.id,
      image,
    });

    res.status(201).json({
      message: "Estabelecimento registrado com sucesso.",
      estabilishment: {
        id: estabilishment.id,
        name: estabilishment.name,
        address: estabilishment.address,
        cnpj: estabilishment.cnpj,
        image: estabilishment.image,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          user_role: user.user_role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getAllEstabilishments = async (req, res) => {
    const { page = 1, limit = 10, address = '' } = req.query;
  
    try {
      const offset = (page - 1) * limit;
  
      const { count, rows: estabilishments } = await Estabilishment.findAndCountAll({
        where: {
          address: {
            [Sequelize.Op.like]: `%${address}%`,
          },
        },
        include: {
          model: User,
          attributes: ['id', 'fullName', 'email', 'phoneNumber', 'user_role'],
        },
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });
  
      const totalPages = Math.ceil(count / limit);
  
      res.status(200).json({
        message: "Estabelecimentos recuperados com sucesso.",
        totalItems: count,
        totalPages,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10),
        estabilishments,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const createProduct = async (req, res) => {
    const { name, price } = req.body;
    const ownerId = req.user.id; // Pegando o id do usuário autenticado
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    if (!name || !price) {
      return res.status(400).json({ message: 'Nome e preço são obrigatórios.' });
    }
  
    try {
      const product = await Product.create({ 
        name, 
        price, 
        image, 
        ownerId  
      });
  
      return res.status(201).json({
        message: 'Produto criado com sucesso!',
        product: { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.image 
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao criar o produto.' });
    }
  };
  const createQrcode = async (req, res) => {
    try {
      const { id } = req.params; // Obtém o ID do estabelecimento pela URL
      const { endereco, nome } = req.body;
  
      if (!endereco || !nome) {
        return res.status(400).json({ error: "Endereço e nome são obrigatórios." });
      }
  
      const estabilishment = await Estabilishment.findByPk(id);
  
      if (!estabilishment) {
        return res.status(404).json({ error: "Estabelecimento não encontrado." });
      }
  
      // Verificar se já existe um QR Code para o estabelecimento
      const existingQrCode = await QrCode.findOne({
        where: { estabilishment_id: id },
      });
  
      if (existingQrCode) {
        // Apagar o QR Code antigo
        await QrCode.destroy({
          where: { estabilishment_id: id },
        });
      }
  
      // Criar o novo QR Code
      const qrData = `ID: ${id}\nEndereço: ${endereco}\nNome: ${nome}`;
      const qrCodeImage = await QRCode.toDataURL(qrData);
  
      const newQrCode = await QrCode.create({
        qr_code_data: qrData,
        qr_code_image: qrCodeImage,
        estabilishment_id: id,
      });
  
      res.status(201).json({
        message: "QR Code criado com sucesso!",
        qrCode: qrCodeImage,
        data: newQrCode,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao gerar o QR Code." });
    }
  };
  const getEstabilishmentById = async (req, res) => {
    const { id } = req.params; // Pega o ID do estabelecimento da URL
    const idNumber = Number(id);
    try {
     
      const estabilishment = await Estabilishment.findByPk(idNumber, {
        include: [
          {
            model: User, // Inclui informações do usuário associado
            attributes: ['id', 'fullName', 'email', 'phoneNumber', 'user_role'],
          },
          {
            model: QrCode, // Inclui informações dos QR Codes associados
            as: "qrCodes", // Use o alias definido na associação
          },
        ],
      });
  
      // Verifica se o estabelecimento foi encontrado
      if (!estabilishment) {
        return res.status(404).json({ message: 'Estabelecimento não encontrado.', id: id});
      }
  
      return res.status(200).json({
        message: 'Estabelecimento recuperado com sucesso.',
        estabilishment,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Erro ao buscar o estabelecimento.', error: error.message });
    }
  };
  
  const createCheckIn = async (req, res) => {
         const {user_id, estabilishment_id} = req.params;
   try{
         const newCheckIn = CheckIn.create({
                user_id : user_id,
                estabilishment_id:estabilishment_id
         })
         res.status(200).json({
              message:"Check in realizado com sucesso"
         })
        }catch(error){
           res.status(500).json({
             message:"Erro ao realizar check in"
           })
        }
  };
module.exports = { registerEstabilishment , getAllEstabilishments, createProduct, getEstabilishmentById, createQrcode, createCheckIn };
