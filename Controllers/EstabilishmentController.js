const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Estabilishment = require('../models/Estabilishment');

const registerEstabilishment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, fullName, email, password, phoneNumber, address } = req.body;

  try {
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
      user_id: user.id,
    });

    res.status(201).json({
      message: "Estabelecimento registrado com sucesso.",
      estabilishment: {
        id: estabilishment.id,
        name: estabilishment.name,
        address: estabilishment.address,
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
