const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const Estabilishment = require("./models/Estabilishment");
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;
const JWT_SECRET = 'daskdnaks4kndkfsDKJFSK';
app.use(express.json());

app.post(
    "/user/register",
    [
      check("fullName").notEmpty().withMessage("Nome completo é obrigatório"),
      check("email")
        .isEmail()
        .withMessage("E-mail inválido"),
      check("password")
        .isLength({ min: 8 })
        .withMessage("A senha deve ter pelo menos 8 caracteres"),
      check("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem"),
      check("phoneNumber")
        .matches(/^\d{11}$/)
        .withMessage("O número de telefone deve conter exatamente 11 dígitos"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { fullName, email, password, phoneNumber } = req.body;
  
      try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: "Email já registrado" });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = await User.create({
          fullName,
          email,
          password: hashedPassword,
          phoneNumber,
        });
  
        res.status(201).json({
          message: "Usuário registrado com sucesso!",
          user: {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
          },
        });
      } catch (error) {
        res.status(500).json({ message: "Erro ao registrar o usuário", error: error.message });
      }
    }
  );
  app.post(
    "/estabilishment/register",
    [
      check("email")
        .isEmail()
        .withMessage("E-mail inválido."),
      check("password")
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres."),
      check("confirmPassword")
        .custom((value, { req }) => value === req.body.password)
        .withMessage("As senhas não coincidem."),
      check("phoneNumber")
        .matches(/^\d{11}$/)
        .withMessage("O número de telefone deve conter exatamente 11 dígitos."),
      check("address")
        .notEmpty()
        .withMessage("O endereço é obrigatório."),
        check("name")
        .notEmpty()
        .withMessage("O nome do estabelecimento é obrigatório."),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { name,fullName, email, password, phoneNumber, address } = req.body;
  
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
            name:estabilishment.name,
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
        await transaction.rollback();
        console.error("Erro ao registrar estabelecimento:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );
  app.post(
    "/login",
    [
      check("email")
        .isEmail()
        .withMessage("E-mail inválido."),
      check("password")
        .isLength({ min: 6 })
        .withMessage("A senha é obrigatória."),
    ],
    async (req, res) => {
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
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login." });
      }
    }
  );

sequelize.sync().then(() => {
    console.log('Banco de dados sincronizado');
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  }).catch(error => {
    console.error('Erro ao sincronizar tabelas:', error);
  });

  module.exports = app;