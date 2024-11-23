const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Estabilishment = require('../models/Estabilishment');
const axios = require('axios');

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
    });

    res.status(201).json({
      message: "Estabelecimento registrado com sucesso.",
      estabilishment: {
        id: estabilishment.id,
        name: estabilishment.name,
        address: estabilishment.address,
        cnpj: estabilishment.cnpj,
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

module.exports = { registerEstabilishment };
