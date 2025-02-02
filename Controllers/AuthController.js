const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const JWT_SECRET = 'daskdnaks4kndkfsDKJFSK';

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Usuário não encontrado." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Senha inválida." });
    }

    const token = jwt.sign(
      { id: user.id, user_role: user.user_role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: "Login bem-sucedido.",
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        user_role: user.user_role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
};
const getAuthenticatedUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não fornecido ou inválido." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      include: [
        { association: "establishments" }, // Inclui os estabelecimentos relacionados
        { association: "products" }, // Inclui os produtos relacionados
      ],
    });
 

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }
    
    req.user = user; // Anexa o usuário autenticado ao objeto req
    return res.status(200).json({
      message: 'Usuário recuperado com sucesso.',
      user,
    });
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado." });
  }
};
module.exports = { login, getAuthenticatedUser};
