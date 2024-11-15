const express = require('express');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const sequelize = require('./config/database');
const Estabilishment = require("./models/Estabilishment");
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;

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
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { email, password, phoneNumber, address } = req.body;
  
      try {
        const existingEstabilishment = await Estabilishment.findOne({ where: { email } });
  
        if (existingEstabilishment) {
          return res.status(400).json({ error: "E-mail já cadastrado." });
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const estabilishment = await Estabilishment.create({
          email,
          password: hashedPassword,
          phoneNumber,
          address,
        });
  
        res.status(201).json({
          message: "Estabelecimento registrado com sucesso.",
          estabilishment: {
            id: estabilishment.id,
            email: estabilishment.email,
            phoneNumber: estabilishment.phoneNumber,
            address: estabilishment.address,
          },
        });
      } catch (error) {
        console.error("Erro ao registrar estabelecimento:", error);
        res.status(500).json({ error: "Erro ao registrar estabelecimento." });
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