const express = require('express');

const cors = require('cors');


const { check } = require('express-validator');

const sequelize = require('./config/database');
const userController = require('./Controllers/UserController');
const estabilishmentController = require('./Controllers/EstabilishmentController');
const authController = require('./Controllers/AuthController');
const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000'  // Allow only requests from localhost:3000
}));
app.use(express.json());

app.post(
  "/user/register",
  [
    check("fullName").notEmpty().withMessage("Nome completo é obrigatório"),
    check("email").isEmail().withMessage("E-mail inválido"),
    check("password").isLength({ min: 8 }).withMessage("A senha deve ter pelo menos 8 caracteres"),
    check("confirmPassword").custom((value, { req }) => value === req.body.password).withMessage("As senhas não coincidem"),
    check("phoneNumber").matches(/^\d{11}$/).withMessage("O número de telefone deve conter exatamente 11 dígitos"),
  ],
  userController.registerUser
);

app.post(
  "/login",
  [
    check("email").isEmail().withMessage("E-mail inválido."),
    check("password").isLength({ min: 6 }).withMessage("A senha é obrigatória."),
  ],
  authController.login
);
app.post(
  "/estabilishment/register",
  [
    check("name").notEmpty().withMessage("O nome do estabelecimento é obrigatório."),
    check("email").isEmail().withMessage("E-mail inválido."),
    check("password").isLength({ min: 6 }).withMessage("A senha deve ter pelo menos 6 caracteres."),
    check("confirmPassword").custom((value, { req }) => value === req.body.password).withMessage("As senhas não coincidem."),
    check("phoneNumber").matches(/^\d{11}$/).withMessage("O número de telefone deve conter exatamente 11 dígitos."),
    check("address").notEmpty().withMessage("O endereço é obrigatório."),
  ],
  estabilishmentController.registerEstabilishment
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
